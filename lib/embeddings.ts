// ملاحظة: عمدًا بدون "server-only" — هاد الملف بينستورد من سكربتات Node
// مستقلة (scripts/*.ts) برّا Next.js نفسو، ومكتبة server-only بترمي خطأ
// بأي سياق مش جوا build الخاص بـ Next.

// عنوان خدمة الذكاء (FastAPI). بالإنتاج بينحط بمتغيّر البيئة AI_SERVICE_URL
// وبيشاور على الخدمة المنشورة على Render؛ محليًا منرجع للبورت الافتراضي.
const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const res = await fetch(`${AI_SERVICE_URL}/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts }),
  });

  if (!res.ok) {
    throw new Error(`AI service /embed failed: ${res.status} ${await res.text()}`);
  }

  const body = (await res.json()) as { embeddings: number[][] };
  return body.embeddings;
}

export async function embedText(text: string): Promise<number[]> {
  const [vector] = await embedTexts([text]);
  return vector;
}

export async function clusterVectors(
  vectors: number[][],
  k: number,
): Promise<{ labels: number[]; centroids: number[][] }> {
  const res = await fetch(`${AI_SERVICE_URL}/cluster`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vectors, k }),
  });

  if (!res.ok) {
    throw new Error(`AI service /cluster failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function averageVectors(vectors: number[][]): number[] {
  const dims = vectors[0].length;
  const sum = new Array(dims).fill(0);
  for (const v of vectors) {
    for (let i = 0; i < dims; i++) sum[i] += v[i];
  }
  return sum.map((x) => x / vectors.length);
}

export function normalize(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((s, x) => s + x * x, 0));
  if (norm === 0) return vector;
  return vector.map((x) => x / norm);
}

export function weightedAverage(
  a: number[],
  weightA: number,
  b: number[],
  weightB: number,
): number[] {
  return a.map((x, i) => x * weightA + b[i] * weightB);
}
