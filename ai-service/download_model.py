"""
سكريبت تحميل الموديل (النسخة ONNX المكمّمة int8).

منزّل بس الملفات يلي بتلزم onnxruntime + tokenizers — يعني بلا أوزان
PyTorch/TensorFlow، فحجم التحميل ~120MB بدل ~500MB. HuggingFace بتنشر
نسخة ONNX رسمية جوّا نفس الريبو تحت مجلد onnx/.

تشغيل محليًا:  ./venv/Scripts/python.exe download_model.py
على الاستضافة: بينشغل ضمن أمر الـ build (شوف render.yaml).
"""

import pathlib
import time

import httpx

REPO = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
BASE_URL = f"https://huggingface.co/{REPO}/resolve/main/"
OUT_DIR = pathlib.Path(__file__).resolve().parent / "models" / "paraphrase-multilingual-MiniLM-L12-v2"

FILES = [
    "config.json",
    "sentence_bert_config.json",
    "1_Pooling/config.json",
    # مُرمِّز SentencePiece (٥MB) بدل tokenizer.json (١٧MB) — نفس الترميز
    # بذاكرة أقل بكتير وقت التشغيل.
    "sentencepiece.bpe.model",
    "special_tokens_map.json",
    # الأوزان المكمّمة int8 — هي لحالها يلي بتنشغل وقت التشغيل.
    "onnx/model_qint8_avx512.onnx",
]


def remote_size(client: httpx.Client, url: str) -> int:
    r = client.head(url, follow_redirects=True, timeout=30)
    r.raise_for_status()
    return int(r.headers["content-length"])


CHUNK_BYTES = 1024 * 1024  # 1MB per request — الاتصال الطويل هو يلي كان عم ينقطع،
# فبدل استريم واحد طويل، منطلب الملف بقطع صغيرة، كل وحدة بطلب HTTP قصير لحاله.


def download_resumable(client: httpx.Client, url: str, dest: pathlib.Path):
    dest.parent.mkdir(parents=True, exist_ok=True)
    expected = remote_size(client, url)

    if dest.exists() and dest.stat().st_size >= expected:
        print(f"  already complete ({expected:,} bytes)", flush=True)
        return

    last_reported = dest.stat().st_size if dest.exists() else 0

    while True:
        existing = dest.stat().st_size if dest.exists() else 0
        if existing >= expected:
            break
        end = min(existing + CHUNK_BYTES - 1, expected - 1)
        headers = {"Range": f"bytes={existing}-{end}"}
        try:
            r = client.get(url, headers=headers, follow_redirects=True, timeout=45)
            if r.status_code not in (200, 206):
                print(f"  unexpected status {r.status_code}; retrying...", flush=True)
                time.sleep(2)
                continue
            mode = "ab" if existing else "wb"
            with open(dest, mode) as f:
                f.write(r.content)
        except Exception as e:
            print(f"  chunk at {existing:,} failed ({type(e).__name__}: {e}); retrying...", flush=True)
            time.sleep(2)
            continue

        new_size = dest.stat().st_size
        if new_size - last_reported >= 1024 * 1024 * 10:
            print(f"  {new_size:,} / {expected:,} bytes", flush=True)
            last_reported = new_size


def main():
    with httpx.Client() as client:
        for name in FILES:
            dest = OUT_DIR / name
            print(f"== {name} ==", flush=True)
            download_resumable(client, BASE_URL + name, dest)
    print("ALL FILES DOWNLOADED", flush=True)


if __name__ == "__main__":
    main()
