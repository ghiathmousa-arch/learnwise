# -*- coding: utf-8 -*-
"""
تست تدفّق كامل عبر الـ API الحقيقي (Next.js على localhost:3000) + قاعدة
البيانات (dev.db)، بيغطي ستة سيناريوهات مطلوبة للأطروحة:

  1) تسجيل حساب ببيانات ناقصة (400) وبريد مكرر (409)
  2) تسجيل الدخول ببيانات خاطئة (401) وصحيحة (200 + جلسة)
  3) initial_embedding قبل/بعد إكمال الـ Onboarding
  4) current_embedding قبل/بعد مشاهدة محتوى (تحديث EMA)

لازم يكون سيرفر Next.js شغّال على localhost:3000 قبل التشغيل.
تشغيل: python scripts/thesis-tests/test_api_flow.py
"""

import json
import math
import sqlite3
import sys
import time
import urllib.error
import urllib.request
from http.cookiejar import CookieJar

BASE = "http://localhost:3000"
DB_PATH = "dev.db"

TEST_EMAIL = f"thesis-test-{int(time.time())}@learnwise.test"
TEST_PASSWORD = "Passw0rd123"
TEST_NAME = "Thesis Test User"

cookie_jar = CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))


def line(title):
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)


def http_json(method, path, payload=None):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(
        BASE + path,
        data=data,
        headers={"Content-Type": "application/json"},
        method=method,
    )
    try:
        with opener.open(req, timeout=30) as r:
            body_text = r.read().decode("utf-8")
            return r.status, json.loads(body_text) if body_text else {}
    except urllib.error.HTTPError as e:
        body_text = e.read().decode("utf-8")
        return e.code, json.loads(body_text) if body_text else {}


def db_row(email):
    conn = sqlite3.connect(DB_PATH)
    row = conn.execute(
        "SELECT id, name, email, level, initialEmbedding, currentEmbedding "
        "FROM User WHERE email = ?",
        (email,),
    ).fetchone()
    conn.close()
    return row


def summarize_vec(raw_json):
    if raw_json is None:
        return "NULL"
    v = json.loads(raw_json)
    preview = ", ".join(f"{x:.4f}" for x in v[:5])
    return f"[{len(v)} أبعاد] أول 5 قيم = [{preview}, ...]"


def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(x * x for x in b))
    return 0.0 if na == 0 or nb == 0 else dot / (na * nb)


# ============================================================
# 1) تسجيل حساب: بيانات ناقصة (400) + بريد مكرر (409)
# ============================================================
line("1) تسجيل حساب — بيانات ناقصة وبريد مكرر")

status, body = http_json("POST", "/api/auth/register", {
    "name": TEST_NAME,
    "email": TEST_EMAIL,
    # password مفقودة عمدًا
})
print(f"POST /api/auth/register  (بدون password)")
print(f"  -> status = {status}")
print(f"  -> body   = {body}")
assert status == 400, "expected 400 for missing password"

status, body = http_json("POST", "/api/auth/register", {
    "name": TEST_NAME,
    "email": TEST_EMAIL,
    "password": TEST_PASSWORD,
})
print(f"\nPOST /api/auth/register  (بيانات صحيحة، حساب جديد)")
print(f"  -> status = {status}")
print(f"  -> body   = {body}")
assert status == 201, "expected 201 for successful registration"

status, body = http_json("POST", "/api/auth/register", {
    "name": TEST_NAME,
    "email": TEST_EMAIL,
    "password": TEST_PASSWORD,
})
print(f"\nPOST /api/auth/register  (نفس البريد {TEST_EMAIL} مرة ثانية)")
print(f"  -> status = {status}")
print(f"  -> body   = {body}")
assert status == 409, "expected 409 for duplicate email"

# الحساب أصبح فيه جلسة نشطة من التسجيل الأول (register بيسجّل دخول تلقائيًا) —
# منمسح الكوكيز عشان نختبر تسجيل الدخول من الصفر بشكل مستقل.
cookie_jar.clear()


# ============================================================
# 2) تسجيل الدخول: بيانات خاطئة (401) وصحيحة (200 + جلسة)
# ============================================================
line("2) تسجيل الدخول — بيانات خاطئة وصحيحة")

status, body = http_json("POST", "/api/auth/login", {
    "email": TEST_EMAIL,
    "password": "wrong-password",
})
print(f"POST /api/auth/login  (كلمة مرور خاطئة)")
print(f"  -> status = {status}")
print(f"  -> body   = {body}")
assert status == 401, "expected 401 for wrong password"

status, body = http_json("POST", "/api/auth/login", {
    "email": TEST_EMAIL,
    "password": TEST_PASSWORD,
})
print(f"\nPOST /api/auth/login  (بيانات صحيحة)")
print(f"  -> status = {status}")
print(f"  -> body   = {body}")
session_cookies = [c.name for c in cookie_jar]
print(f"  -> session cookie set: {session_cookies}")
assert status == 200, "expected 200 for correct login"
assert any(c == "session" for c in session_cookies), "expected session cookie"


# ============================================================
# 3) initial_embedding قبل/بعد الـ Onboarding
# ============================================================
line("3) initial_embedding قبل/بعد إكمال الـ Onboarding")

row_before = db_row(TEST_EMAIL)
print(f"قبل الـ Onboarding — صف المستخدم في dev.db:")
print(f"  id={row_before[0]}  level={row_before[3]}")
print(f"  initialEmbedding = {summarize_vec(row_before[4])}")
print(f"  currentEmbedding = {summarize_vec(row_before[5])}")
assert row_before[4] is None, "expected initialEmbedding to be NULL before onboarding"

status, body = http_json("POST", "/api/onboarding", {
    "level": "intermediate",
    "topicIds": [1],  # Python
    "goal": "skill",
    "learningStyle": "practical",
    "weeklyTime": "balanced",
})
print(f"\nPOST /api/onboarding  (level=intermediate, topic=Python)")
print(f"  -> status = {status}")
print(f"  -> body   = {body}")
assert status == 200, "expected 200 for onboarding"

row_after = db_row(TEST_EMAIL)
print(f"\nبعد الـ Onboarding — صف المستخدم في dev.db:")
print(f"  initialEmbedding = {summarize_vec(row_after[4])}")
print(f"  currentEmbedding = {summarize_vec(row_after[5])}")
assert row_after[4] is not None, "expected initialEmbedding to be populated after onboarding"
assert row_after[4] == row_after[5], "expected initial == current right after onboarding"


# ============================================================
# 4) current_embedding قبل/بعد مشاهدة محتوى (تحديث EMA)
# ============================================================
line("4) current_embedding قبل/بعد مشاهدة محتوى (EMA)")

conn = sqlite3.connect(DB_PATH)
content_row = conn.execute(
    "SELECT id, title, embedding FROM Content WHERE embedding IS NOT NULL "
    "AND clusterId != 1 ORDER BY id LIMIT 1"
).fetchone()
conn.close()
content_id, content_title, content_embedding_raw = content_row
content_vec = json.loads(content_embedding_raw)
print(f"المحتوى المستخدم للاختبار: #{content_id} \"{content_title[:60]}\"")

before_vec = json.loads(db_row(TEST_EMAIL)[5])
sim_before = cosine(before_vec, content_vec)
print(f"\ncurrentEmbedding قبل المشاهدة:")
print(f"  {summarize_vec(json.dumps(before_vec))}")
print(f"  cosine(currentEmbedding, embedding المحتوى) = {sim_before:.4f}")

status, body = http_json("POST", f"/api/content/{content_id}/view", {})
print(f"\nPOST /api/content/{content_id}/view")
print(f"  -> status = {status}")
print(f"  -> body   = {body}")
assert status == 201, "expected 201 for view tracked"

after_vec = json.loads(db_row(TEST_EMAIL)[5])
sim_after = cosine(after_vec, content_vec)
moved = cosine(before_vec, after_vec)
print(f"\ncurrentEmbedding بعد المشاهدة:")
print(f"  {summarize_vec(json.dumps(after_vec))}")
print(f"  cosine(currentEmbedding, embedding المحتوى) = {sim_after:.4f}  (كان {sim_before:.4f})")
print(f"  cosine(before, after) = {moved:.4f}  (تحديث تدريجي — مش نسخ كامل، alpha=0.15)")
assert sim_after > sim_before, "expected similarity to content to increase after EMA update"
assert 0.9 < moved < 1.0, "expected a partial (not total) shift"

line("كل السيناريوهات الستة نجحت ✔")
print(f"مستخدم الاختبار: {TEST_EMAIL} (id={row_after[0]})")
