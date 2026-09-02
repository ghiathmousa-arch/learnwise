// سكربت يجلب محتوى حقيقي (فيديوهات YouTube + مقالات Dev.to) ويخزّنه بجدول
// Content. هاد نسخة TypeScript خفيفة من "سكربت التحضير" المذكور بخطة
// المرحلة 2 — عمدًا مش Python: لسا ما في حاجة فعلية لخدمة Python لحد ما
// نبني حساب الـ embeddings الحقيقي (sentence-transformers) بمرحلة لاحقة.
//
// تصنيف الموضوع (clusterId) هون كمان heuristic بسيط بالكلمات المفتاحية،
// مش نتيجة K-Means حقيقية — رح تتحدّث لاحقًا لما تجهز المرحلة الكاملة.

import "dotenv/config";
import { prisma } from "../lib/prisma";

type ContentType = "video" | "article";

type ContentDraft = {
  title: string;
  description: string;
  type: ContentType;
  source: string;
  url: string;
  thumbnailUrl: string | null;
  durationMinutes: number;
};

type DevToArticle = {
  title?: string;
  description?: string | null;
  url?: string;
  cover_image?: string | null;
  reading_time_minutes?: number | null;
};

type YouTubeSearchResponse = {
  items?: { id?: { videoId?: string } }[];
};

type YouTubeVideoItem = {
  id: string;
  snippet: {
    title: string;
    description?: string;
    thumbnails?: { medium?: { url: string }; default?: { url: string } };
  };
  contentDetails: { duration: string };
};

type YouTubeVideosResponse = { items?: YouTubeVideoItem[] };

const CLUSTER_KEYWORDS: Record<string, string[]> = {
  Python: ["python", "django", "flask", "fastapi"],
  "تطوير الويب": [
    "javascript",
    "typescript",
    "react",
    "vue",
    "angular",
    "css",
    "html",
    "next.js",
    "frontend",
    "web dev",
  ],
  "هياكل البيانات": ["data structure", "algorithm", "leetcode", "big o"],
  "قواعد البيانات": ["database", "sql", "postgres", "mysql", "mongodb", "redis"],
  الحاويات: ["docker", "container", "kubernetes", "k8s"],
  "أمن التطبيقات": ["security", "auth", "owasp", "encryption", "vulnerability"],
  "الذكاء الاصطناعي": [
    "machine learning",
    "artificial intelligence",
    "neural network",
    "deep learning",
    "llm",
  ],
  "الأنظمة الموزّعة": [
    "distributed system",
    "microservice",
    "system design",
    "scalability",
    "load balanc",
  ],
};

const DEVTO_TAGS = [
  "python",
  "webdev",
  "javascript",
  "algorithms",
  "database",
  "docker",
  "security",
  "machinelearning",
];

const YOUTUBE_QUERIES = [
  "Python tutorial",
  "web development tutorial",
  "data structures and algorithms",
  "SQL database tutorial",
  "Docker container tutorial",
  "application security tutorial",
  "machine learning tutorial",
  "distributed systems tutorial",
];

function detectDifficulty(
  text: string,
): "beginner" | "intermediate" | "advanced" {
  const t = text.toLowerCase();
  if (/\b(beginner|intro|introduction|101|basics|getting started)\b/.test(t)) {
    return "beginner";
  }
  if (/\b(advanced|expert|deep dive|internals)\b/.test(t)) {
    return "advanced";
  }
  return "intermediate";
}

function detectCluster(text: string): string | null {
  const t = text.toLowerCase();
  for (const [label, keywords] of Object.entries(CLUSTER_KEYWORDS)) {
    if (keywords.some((k) => t.includes(k))) return label;
  }
  return null;
}

function parseIsoDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 5;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  return Math.max(1, Math.round(hours * 60 + minutes + seconds / 60));
}

async function fetchDevToArticles(): Promise<ContentDraft[]> {
  const drafts: ContentDraft[] = [];

  for (const tag of DEVTO_TAGS) {
    const res = await fetch(
      `https://dev.to/api/articles?tag=${tag}&per_page=15&top=90`,
    );
    if (!res.ok) {
      console.error(`Dev.to fetch failed for tag "${tag}": ${res.status}`);
      continue;
    }
    const articles = (await res.json()) as DevToArticle[];

    for (const a of articles) {
      if (!a.title || !a.url) continue;
      drafts.push({
        title: a.title,
        description: a.description ?? "",
        type: "article",
        source: "Dev.to",
        url: a.url,
        thumbnailUrl: a.cover_image ?? null,
        durationMinutes: a.reading_time_minutes ?? 5,
      });
    }
  }

  return drafts;
}

async function fetchYoutubeVideos(apiKey: string): Promise<ContentDraft[]> {
  const drafts: ContentDraft[] = [];

  for (const query of YOUTUBE_QUERIES) {
    const searchUrl =
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video` +
      `&maxResults=10&relevanceLanguage=en&q=${encodeURIComponent(query)}&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      console.error(`YouTube search failed for "${query}": ${searchRes.status}`);
      continue;
    }
    const searchData = (await searchRes.json()) as YouTubeSearchResponse;
    const ids = (searchData.items ?? [])
      .map((i) => i.id?.videoId)
      .filter((id): id is string => Boolean(id));
    if (ids.length === 0) continue;

    const videosUrl =
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails` +
      `&id=${ids.join(",")}&key=${apiKey}`;
    const videosRes = await fetch(videosUrl);
    if (!videosRes.ok) continue;
    const videosData = (await videosRes.json()) as YouTubeVideosResponse;

    for (const v of videosData.items ?? []) {
      drafts.push({
        title: v.snippet.title,
        description: v.snippet.description ?? "",
        type: "video",
        source: "YouTube",
        url: `https://www.youtube.com/watch?v=${v.id}`,
        thumbnailUrl:
          v.snippet.thumbnails?.medium?.url ??
          v.snippet.thumbnails?.default?.url ??
          null,
        durationMinutes: parseIsoDuration(v.contentDetails.duration),
      });
    }
  }

  return drafts;
}

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  console.log("Fetching Dev.to articles...");
  const articles = await fetchDevToArticles();
  console.log(`Got ${articles.length} articles.`);

  let videos: ContentDraft[] = [];
  if (apiKey) {
    console.log("Fetching YouTube videos...");
    videos = await fetchYoutubeVideos(apiKey);
    console.log(`Got ${videos.length} videos.`);
  } else {
    console.log(
      "YOUTUBE_API_KEY not set in .env — skipping video fetch. Add it and re-run to include videos.",
    );
  }

  const clusters = await prisma.cluster.findMany();
  const clusterIdByLabel = new Map(clusters.map((c) => [c.label, c.id]));

  let created = 0;
  let updated = 0;

  for (const item of [...articles, ...videos]) {
    const text = `${item.title} ${item.description}`;
    const difficultyLevel = detectDifficulty(text);
    const clusterLabel = detectCluster(text);
    const clusterId = clusterLabel ? (clusterIdByLabel.get(clusterLabel) ?? null) : null;

    const existing = await prisma.content.findUnique({
      where: { url: item.url },
      select: { id: true },
    });

    await prisma.content.upsert({
      where: { url: item.url },
      update: {
        title: item.title,
        description: item.description,
        thumbnailUrl: item.thumbnailUrl,
        durationMinutes: item.durationMinutes,
        difficultyLevel,
        clusterId,
      },
      create: {
        title: item.title,
        description: item.description,
        type: item.type,
        source: item.source,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl,
        durationMinutes: item.durationMinutes,
        difficultyLevel,
        clusterId,
      },
    });

    if (existing) updated++;
    else created++;
  }

  const total = await prisma.content.count();
  console.log(`Done. Created ${created}, updated ${updated}, total rows: ${total}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
