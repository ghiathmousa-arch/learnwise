# -*- coding: utf-8 -*-
"""
تست K-Means: بيحسب Silhouette Score لعدد التجمّعات K من 6 إلى 8 على
embeddings المحتوى الحقيقية الموجودة بقاعدة البيانات (dev.db)، لمقارنة
جودة التجميع وتبرير اختيار K=8 (المطابق لعدد المواضيع الـ 8 المُعرَّفة
مسبقًا بجدول Cluster).

لازم compute-content-embeddings.ts يكون خلص قبلها (عمود Content.embedding
معبّى). ما بيحتاج خدمة الذكاء تكون شغالة — بيقرأ المتجهات مباشرة من
dev.db وبيشغّل KMeans + silhouette_score محليًا عبر scikit-learn.

تشغيل: ai-service/venv/Scripts/python.exe scripts/thesis-tests/test_silhouette.py
"""

import json
import sqlite3

import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

DB_PATH = "dev.db"

conn = sqlite3.connect(DB_PATH)
rows = conn.execute(
    "SELECT id, embedding FROM Content WHERE embedding IS NOT NULL"
).fetchall()
conn.close()

ids = [r[0] for r in rows]
X = np.array([json.loads(r[1]) for r in rows])
print(f"عدد عناصر المحتوى المستخدمة: {len(ids)}  |  أبعاد كل متجه: {X.shape[1]}")

print(f"\n{'K':>3} | {'Silhouette Score':>17} | {'Inertia':>12}")
print("-" * 40)

results = []
for k in (6, 7, 8):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X)
    score = silhouette_score(X, labels)
    results.append((k, score, km.inertia_))
    print(f"{k:>3} | {score:>17.4f} | {km.inertia_:>12.2f}")

best = max(results, key=lambda r: r[1])
print(f"\nأعلى Silhouette Score: K={best[0]} (score={best[1]:.4f})")
print(
    "ملاحظة: K=8 مُثبَّت فعليًا بالمشروع (scripts/run-clustering.ts) لأنه "
    "لازم يطابق عدد المواضيع الـ 8 المُعرَّفة مسبقًا بجدول Cluster ويتوافق "
    "مع اختيارات الطلاب وقت الـ Onboarding — هاد الجدول مرجع لمقارنة الجودة "
    "الإحصائية بس، مش لتغيير K الفعلي."
)
