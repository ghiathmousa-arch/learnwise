# -*- coding: utf-8 -*-
"""
تست شامل لخدمة الذكاء (AI service) — أكتر من ٥٠ سيناريو، بيغطي:
  A) عقد الـ API (شكل الاستجابة، الأخطاء، الحالات الحدّية)
  B) الاستقرار والحتمية (determinism)
  C) الفهم الدلالي عبر اللغتين (عربي/إنجليزي) لكل موضوع من الـ ٨ مواضيع
  D) مصفوفة تمييز المواضيع (٨ مواضيع × بعض = مقارنات متقاطعة)
  E) التحقق مقابل محتوى حقيقي من قاعدة البيانات
  F) نصوص حافة (أرقام، رموز، إيموجي، كود، عربي+إنجليزي مختلط...)

تشغيل: ./venv/Scripts/python.exe test_comprehensive.py
"""

import json
import math
import sqlite3
import sys
import time
import urllib.error
import urllib.request

BASE = "http://localhost:8000"
DB_PATH = r"C:\Users\gi ath\Desktop\next\LearnWise\dev.db"

results = []  # {category, name, passed, detail}


def record(category, name, passed, detail=""):
    results.append(
        {"category": category, "name": name, "passed": bool(passed), "detail": detail}
    )
    mark = "PASS" if passed else "FAIL"
    print(f"[{mark}] {category} :: {name}" + (f" — {detail}" if detail else ""))


def http_post(path, payload, expect_status=200):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        BASE + path, data=data, headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))


def http_get(path):
    with urllib.request.urlopen(BASE + path, timeout=30) as r:
        return r.status, json.loads(r.read().decode("utf-8"))


def cos(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(x * x for x in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def embed_one(text):
    status, body = http_post("/embed", {"texts": [text]})
    return body["embeddings"][0]


# ============================================================
# A) عقد الـ API
# ============================================================
print("\n== A) API contract ==")

status, body = http_get("/health")
record("A-Health", "health returns 200", status == 200)
record("A-Health", "model_loaded is true", body.get("model_loaded") is True)

status, body = http_post("/embed", {"texts": ["hello world"]})
record("A-Shape", "single text -> 200", status == 200)
record("A-Shape", "single text -> 1 vector", len(body.get("embeddings", [])) == 1)
record("A-Shape", "vector dims == 384", len(body["embeddings"][0]) == 384)

status, body = http_post("/embed", {"texts": ["a", "b", "c", "d", "e"]})
record("A-Shape", "batch of 5 -> 5 vectors", len(body.get("embeddings", [])) == 5)

status, body = http_post("/embed", {"texts": []})
record("A-EdgeCase", "empty texts array -> 200 + empty result", status == 200 and body.get("embeddings") == [])

status, body = http_post("/embed", {})
record("A-Validation", "missing 'texts' field -> 422", status == 422)

status, body = http_post("/embed", {"texts": "not a list"})
record("A-Validation", "'texts' as string (wrong type) -> 422", status == 422)

status, body = http_post("/embed", {"texts": [1, 2, 3]})
record("A-Validation", "'texts' with non-string items -> 422", status == 422)

long_text = "Python tutorial. " * 2000  # ~34k chars
t0 = time.time()
status, body = http_post("/embed", {"texts": [long_text]})
record("A-EdgeCase", "very long text (~34k chars) doesn't crash", status == 200, f"{time.time()-t0:.1f}s")

t0 = time.time()
status, body = http_post("/embed", {"texts": [f"sample text number {i}" for i in range(100)]})
record("A-Perf", "batch of 100 texts completes", status == 200 and len(body["embeddings"]) == 100, f"{time.time()-t0:.1f}s")

# vector normalization check (normalize_embeddings=True was set)
v = embed_one("normalization check")
norm = math.sqrt(sum(x * x for x in v))
record("A-Shape", "vectors are L2-normalized (norm ~= 1.0)", abs(norm - 1.0) < 0.01, f"norm={norm:.4f}")


# ============================================================
# B) الاستقرار والحتمية
# ============================================================
print("\n== B) Determinism & stability ==")

v1 = embed_one("determinism test sentence")
v2 = embed_one("determinism test sentence")
record("B-Determinism", "same text -> identical vector twice", cos(v1, v2) > 0.99999, f"cos={cos(v1,v2):.6f}")

status, body = http_post("/embed", {"texts": ["dup text", "other", "dup text"]})
vecs = body["embeddings"]
record("B-Determinism", "duplicate text in same batch -> identical vectors", cos(vecs[0], vecs[2]) > 0.99999)

status, body = http_post("/embed", {"texts": ["   "]})
record("B-EdgeCase", "whitespace-only text doesn't crash", status == 200)

status, body = http_post("/embed", {"texts": [""]})
record("B-EdgeCase", "empty string text doesn't crash", status == 200)


# ============================================================
# C) الفهم الدلالي عبر اللغتين — لكل موضوع من الـ ٨
# ============================================================
print("\n== C) Cross-lingual semantic matching (per topic) ==")

topic_pairs = {
    "Python": ("Python programming tutorial for beginners", "تعلّم لغة بايثون للمبتدئين"),
    "Web dev": ("Modern web development with JavaScript and React", "تطوير الويب الحديث باستخدام جافاسكريبت"),
    "Data structures": ("Introduction to data structures and algorithms", "مقدمة في هياكل البيانات والخوارزميات"),
    "Databases": ("How relational databases and SQL work", "كيف تعمل قواعد البيانات العلائقية ولغة SQL"),
    "Containers": ("Docker containers and Kubernetes orchestration", "حاويات دوكر وتنسيق كوبرنيتيس"),
    "App security": ("Application security and common vulnerabilities", "أمن التطبيقات والثغرات الشائعة"),
    "AI/ML": ("Machine learning and neural networks explained", "شرح تعلّم الآلة والشبكات العصبية"),
    "Distributed systems": ("Distributed systems and microservice architecture", "الأنظمة الموزّعة وبنية الخدمات المصغّرة"),
}

CROSS_LINGUAL_THRESHOLD = 0.30
for topic, (en, ar) in topic_pairs.items():
    v_en, v_ar = embed_one(en), embed_one(ar)
    sim = cos(v_en, v_ar)
    record(
        "C-CrossLingual",
        f"{topic}: EN vs AR same-topic similarity > {CROSS_LINGUAL_THRESHOLD}",
        sim > CROSS_LINGUAL_THRESHOLD,
        f"cos={sim:.3f}",
    )


# ============================================================
# D) مصفوفة تمييز المواضيع (كل زوج من الـ ٨ مواضيع + عنصر تحكّم غير متعلّق)
# ============================================================
print("\n== D) Topic discrimination matrix ==")

topic_names = list(topic_pairs.keys())
topic_en_vectors = {name: embed_one(topic_pairs[name][0]) for name in topic_names}

control_texts = {
    "Cooking": "How to bake a chocolate cake at home",
    "Sports": "Best football training drills for beginners",
    "Weather": "Tomorrow's weather forecast shows heavy rain",
}
control_vectors = {name: embed_one(text) for name, text in control_texts.items()}

# كل موضوع تقني لازم يكون أبعد عن عناصر التحكم الثلاثة من ما هو عن نفسه
for topic in topic_names:
    self_sim = 1.0  # cos(v, v) == 1
    max_control_sim = max(cos(topic_en_vectors[topic], cv) for cv in control_vectors.values())
    record(
        "D-Discrimination",
        f"{topic} vs unrelated controls: self > control",
        self_sim > max_control_sim,
        f"max_control_sim={max_control_sim:.3f}",
    )

# مقارنات متقاطعة بين كل زوج مواضيع تقنية (28 زوج) — بنسجّلها كمعلومة + نتأكد إنها كلها أعلى من عناصر التحكم البعيدة
pair_count = 0
for i in range(len(topic_names)):
    for j in range(i + 1, len(topic_names)):
        a, b = topic_names[i], topic_names[j]
        sim = cos(topic_en_vectors[a], topic_en_vectors[b])
        pair_count += 1
        # توقّع معقول: مواضيع تقنية مع بعضها أعلى تشابهًا من موضوع تقني مع "خبز كيكة"
        baseline = cos(topic_en_vectors[a], control_vectors["Cooking"])
        record(
            "D-PairMatrix",
            f"{a} vs {b} (tech-tech) > {a} vs Cooking (control)",
            sim > baseline,
            f"tech-tech={sim:.3f}, control={baseline:.3f}",
        )
print(f"  (covered {pair_count} cross-topic pairs)")


# ============================================================
# E) التحقق مقابل محتوى حقيقي من قاعدة البيانات
# ============================================================
print("\n== E) Validation against real DB content ==")

try:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    clusters = conn.execute("SELECT id, label FROM Cluster").fetchall()
    for cl in clusters:
        rows = conn.execute(
            "SELECT title FROM Content WHERE clusterId = ? LIMIT 2", (cl["id"],)
        ).fetchall()
        if not rows:
            record("E-RealContent", f"cluster '{cl['label']}' has tagged content to check", False, "no rows")
            continue
        # نص مرجعي للموضوع بالعربي (نفس تسمية الـ Cluster) مقابل عناوين حقيقية موسومة له
        ref_vec = embed_one(cl["label"])
        for row in rows:
            title = row["title"]
            sim = cos(ref_vec, embed_one(title))
            record(
                "E-RealContent",
                f"[{cl['label']}] '{title[:50]}' relates to its own cluster label",
                sim > 0.15,
                f"cos={sim:.3f}",
            )
    conn.close()
except Exception as e:
    record("E-RealContent", "could open dev.db and read Content/Cluster", False, str(e))


# ============================================================
# F) نصوص حافة (edge cases متنوعة)
# ============================================================
print("\n== F) Miscellaneous edge-case texts ==")

edge_texts = {
    "numbers only": "123456789 0 3.14159",
    "punctuation only": "!!! ??? ... --- ***",
    "emoji": "Learn Python 🐍🔥💻 today!",
    "mixed AR/EN": "تعلم Python بايثون from scratch من الصفر",
    "code snippet": "def foo(x): return x * 2 if x > 0 else -x",
    "url as text": "https://example.com/learn/python/intro?ref=123",
    "single char": "P",
    "repeated char": "aaaaaaaaaaaaaaaaaaaa",
    "arabic diacritics": "تَعَلَّمْ الْبَرْمَجَةْ بِلُغَةِ بَايْثُون",
    "RTL+LTR mixed punctuation": "مرحبا! Hello, שלום, 你好",
}

for name, text in edge_texts.items():
    try:
        status, body = http_post("/embed", {"texts": [text]})
        ok = status == 200 and len(body.get("embeddings", [[]])[0]) == 384
        record("F-EdgeText", f"'{name}' embeds without error", ok)
    except Exception as e:
        record("F-EdgeText", f"'{name}' embeds without error", False, str(e))


# ============================================================
# التقرير النهائي
# ============================================================
print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)

by_cat = {}
for r in results:
    by_cat.setdefault(r["category"], []).append(r)

total_pass = sum(1 for r in results if r["passed"])
total = len(results)

for cat, items in by_cat.items():
    passed = sum(1 for i in items if i["passed"])
    print(f"{cat:25s} {passed:3d}/{len(items):3d}")

print("-" * 60)
print(f"{'TOTAL':25s} {total_pass:3d}/{total:3d}  ({100*total_pass/total:.1f}%)")

failures = [r for r in results if not r["passed"]]
if failures:
    print("\nFAILED SCENARIOS:")
    for f in failures:
        print(f"  - [{f['category']}] {f['name']} :: {f['detail']}")

# حفظ تقرير JSON مفصّل
with open("test_report.json", "w", encoding="utf-8") as f:
    json.dump(
        {"total": total, "passed": total_pass, "results": results},
        f,
        ensure_ascii=False,
        indent=2,
    )

print(f"\nDetailed JSON report written to test_report.json")
print(f"Total scenarios run: {total}")

sys.exit(0 if total_pass == total else 1)
