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

فرق التكميم على نتائج التشابه مهمل (ارتباط > 0.99 مع نسخة fp32).
"""

from contextlib import asynccontextmanager
from pathlib import Path

import numpy as np
import onnxruntime as ort
from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.cluster import KMeans
from tokenizers import Tokenizer

MODEL_DIR = Path(__file__).resolve().parent.parent / "models" / "paraphrase-multilingual-MiniLM-L12-v2"
ONNX_PATH = MODEL_DIR / "onnx" / "model_qint8_avx512.onnx"
TOKENIZER_PATH = MODEL_DIR / "tokenizer.json"

MAX_SEQ_LENGTH = 128  # من sentence_bert_config.json
PAD_TOKEN_ID = 1  # <pad> بـ XLM-RoBERTa

session: ort.InferenceSession | None = None
tokenizer: Tokenizer | None = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    global session, tokenizer

    tokenizer = Tokenizer.from_file(str(TOKENIZER_PATH))
    tokenizer.enable_truncation(max_length=MAX_SEQ_LENGTH)
    tokenizer.enable_padding(pad_id=PAD_TOKEN_ID, pad_token="<pad>")

    # خيط واحد: الخطة المجانية بتعطي جزء من نواة، وكل خيط زيادة بياخد ذاكرة
    # بلا فايدة. وبنطفي الـ arena حتى الذاكرة ترجع للنظام بعد كل طلب.
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

    encodings = tokenizer.encode_batch(texts)
    input_ids = np.array([e.ids for e in encodings], dtype=np.int64)
    attention_mask = np.array([e.attention_mask for e in encodings], dtype=np.int64)

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
    X = np.array(payload.vectors)
    km = KMeans(n_clusters=payload.k, random_state=42, n_init=10)
    labels = km.fit_predict(X)
    return {"labels": labels.tolist(), "centroids": km.cluster_centers_.tolist()}
