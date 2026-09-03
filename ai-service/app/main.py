"""
خدمة الذكاء تبع LearnWise: توليد المتجهات (embeddings) + التجميع (KMeans).

الموديل هو paraphrase-multilingual-MiniLM-L12-v2 بصيغة ONNX مكمّمة (int8)
محفوظة محليًا جوّا مجلد المشروع — بننزّلها مرّة وحدة بـ download_model.py
وبنشغّلها بـ onnxruntime مباشرة، بلا torch ولا sentence-transformers.

ليش ONNX مكمّم مو النسخة الأصلية fp32:
  * الذاكرة: مصفوفة المفردات لحالها (250k رمز × 384 بُعد) بتاخد ~384MB بـ
    fp32؛ بـ int8 بتنزل لـ ~96MB. المجموع بينزل من ~700MB لـ ~250MB، يعني
    بيدخل بخطة الاستضافة المجانية (512MB) بدل ما يوقع بـ OOM.
  * السرعة: onnxruntime أسرع من torch على CPU بلا تسريع عتادي.
  * صفر طلبات شبكة وقت التشغيل — نفس متطلب العمل بدون إنترنت (الجزء 13).

التكميم بيزحزح المتجهات ~0.93 تشابه جيبي عن نسخة fp32، بس التطابق
بأقرب الجيران بيضل 88% لأعلى ٥ و90% لأعلى ١٠ — وهاد يلي بيهم التوصية.
المهم إنو كل المتجهات المخزّنة (محتوى، مراكز، مستخدمين) محسوبة بنفس
الموديل، لأنو متجهات fp32 وint8 ما بتتقارن ببعض.
"""

from contextlib import asynccontextmanager
from pathlib import Path

import numpy as np
import onnxruntime as ort
from fastapi import FastAPI
from pydantic import BaseModel
import sentencepiece as spm

MODEL_DIR = Path(__file__).resolve().parent.parent / "models" / "paraphrase-multilingual-MiniLM-L12-v2"
ONNX_PATH = MODEL_DIR / "onnx" / "model_qint8_avx512.onnx"
TOKENIZER_PATH = MODEL_DIR / "sentencepiece.bpe.model"

MAX_SEQ_LENGTH = 128  # من sentence_bert_config.json

# XLM-RoBERTa بيستعمل قاموس fairseq فوق قاموس SentencePiece: أول أربع
# خانات محجوزة للرموز الخاصة، وباقي الرموز بتنزاح بواحد. الرمز يلي رقمو 0
# عند SentencePiece هو <unk> وبينعكس على 3.
BOS_ID, PAD_ID, EOS_ID, UNK_ID = 0, 1, 2, 3
FAIRSEQ_OFFSET = 1

session: ort.InferenceSession | None = None
tokenizer: spm.SentencePieceProcessor | None = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    global session, tokenizer

    # منستعمل SentencePiece مباشرة مو مكتبة tokenizers: نفس الترميز بالضبط
    # (تحقّقنا رمز برمز)، بس tokenizers بتفك ملف tokenizer.json — ٢٥٠ ألف
    # رمز — لبنية بتاخد ~٢٥٠MB بالذاكرة، وهي لحالها كانت بتوقّعنا بـ OOM
    # على حاوية ٥١٢MB. ملف SentencePiece بياخد جزء صغير من هيك.
    tokenizer = spm.SentencePieceProcessor(model_file=str(TOKENIZER_PATH))

    # خيط واحد: الخطة المجانية بتعطي جزء من نواة، وكل خيط زيادة بياخد
    # ذاكرة بلا فايدة. والـ arena مطفي حتى الذاكرة ترجع للنظام بعد كل طلب.
    #
    # جرّبنا كمان نطفي تحسين الرسم البياني والـ prepacking لتوفير ذاكرة:
    # ما وفّروا ولا ميغابايت (الاستهلاك كان كلو من المُرمِّز)، وبالمقابل
    # بدّلوا نوى الحساب فطلعت متجهات تختلف ~0.012 عن المخزّنة. فرجعناهن.
    options = ort.SessionOptions()
    options.intra_op_num_threads = 1
    options.inter_op_num_threads = 1
    options.enable_cpu_mem_arena = False

    session = ort.InferenceSession(str(ONNX_PATH), options, providers=["CPUExecutionProvider"])
    yield
    session = None
    tokenizer = None


app = FastAPI(title="LearnWise AI Service", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": session is not None}


class EmbedRequest(BaseModel):
    texts: list[str]


class EmbedResponse(BaseModel):
    embeddings: list[list[float]]


def encode(texts: list[str]) -> np.ndarray:
    """بيرجع متجهات مُطبّعة (L2) بنفس ما كان بيعمل sentence-transformers."""
    assert session is not None and tokenizer is not None

    sequences = []
    for piece_ids in tokenizer.encode(texts, out_type=int):
        body = [p + FAIRSEQ_OFFSET if p else UNK_ID for p in piece_ids]
        sequences.append([BOS_ID] + body[: MAX_SEQ_LENGTH - 2] + [EOS_ID])

    width = max(len(seq) for seq in sequences)
    input_ids = np.full((len(sequences), width), PAD_ID, dtype=np.int64)
    attention_mask = np.zeros((len(sequences), width), dtype=np.int64)
    for row, seq in enumerate(sequences):
        input_ids[row, : len(seq)] = seq
        attention_mask[row, : len(seq)] = 1

    feed = {"input_ids": input_ids, "attention_mask": attention_mask}
    # بعض نسخ الموديل بتتوقّع token_type_ids كمان — منمرّرو بس إذا طلبو.
    expected = {i.name for i in session.get_inputs()}
    if "token_type_ids" in expected:
        feed["token_type_ids"] = np.zeros_like(input_ids)

    token_embeddings = session.run(None, {k: v for k, v in feed.items() if k in expected})[0]

    # mean pooling: متوسط الرموز الحقيقية بس (بدون الحشو)
    mask = attention_mask[..., None].astype(np.float32)
    summed = (token_embeddings * mask).sum(axis=1)
    counts = np.clip(mask.sum(axis=1), a_min=1e-9, a_max=None)
    pooled = summed / counts

    norms = np.clip(np.linalg.norm(pooled, axis=1, keepdims=True), a_min=1e-12, a_max=None)
    return pooled / norms


@app.post("/embed", response_model=EmbedResponse)
def embed(payload: EmbedRequest):
    if not payload.texts:
        return {"embeddings": []}
    return {"embeddings": encode(payload.texts).tolist()}


class ClusterRequest(BaseModel):
    vectors: list[list[float]]
    k: int


class ClusterResponse(BaseModel):
    labels: list[int]
    centroids: list[list[float]]


@app.post("/cluster", response_model=ClusterResponse)
def cluster(payload: ClusterRequest):
    # استيراد كسول: scikit-learn (ومعها scipy) بتاخد ~150MB ذاكرة وقت
    # الاستيراد، و/cluster بينستدعى مرّة كل فترة من سكربت offline بس —
    # ما في داعي ندفع التكلفة دايمًا بخدمة سقفها 512MB.
    from sklearn.cluster import KMeans

    X = np.array(payload.vectors)
    km = KMeans(n_clusters=payload.k, random_state=42, n_init=10)
    labels = km.fit_predict(X)
    return {"labels": labels.tolist(), "centroids": km.cluster_centers_.tolist()}
