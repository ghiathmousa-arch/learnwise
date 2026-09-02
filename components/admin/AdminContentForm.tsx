"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Cluster = { id: number; label: string };

type ContentValues = {
  title: string;
  description: string;
  type: string;
  source: string;
  url: string;
  thumbnailUrl: string;
  difficultyLevel: string;
  durationMinutes: string;
  clusterId: string;
};

const EMPTY_VALUES: ContentValues = {
  title: "",
  description: "",
  type: "video",
  source: "",
  url: "",
  thumbnailUrl: "",
  difficultyLevel: "beginner",
  durationMinutes: "",
  clusterId: "",
};

const inputClasses =
  "rounded-lg border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-teal";
const labelClasses = "text-[13px] font-medium text-ink";

export default function AdminContentForm({
  clusters,
  mode,
  contentId,
  initial,
}: {
  clusters: Cluster[];
  mode: "create" | "edit";
  contentId?: number;
  initial?: Partial<ContentValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ContentValues>({
    ...EMPTY_VALUES,
    ...initial,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof ContentValues>(key: K, value: ContentValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const payload = {
      title: values.title,
      description: values.description,
      type: values.type,
      source: values.source,
      url: values.url,
      thumbnailUrl: values.thumbnailUrl || null,
      difficultyLevel: values.difficultyLevel,
      durationMinutes: Number(values.durationMinutes),
      clusterId: values.clusterId ? Number(values.clusterId) : null,
    };

    try {
      const res = await fetch(
        mode === "create" ? "/api/admin/content" : `/api/admin/content/${contentId}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "صار في خطأ، حاول مرة ثانية.");
        setPending(false);
        return;
      }

      router.push("/admin/content");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم. تحقّق من الاتصال وحاول مرة ثانية.");
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-lg border border-line p-7"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className={labelClasses}>العنوان</span>
          <input
            required
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className={labelClasses}>الوصف</span>
          <textarea
            required
            rows={3}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            className={`${inputClasses} resize-none`}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClasses}>النوع</span>
          <select
            value={values.type}
            onChange={(e) => set("type", e.target.value)}
            className={inputClasses}
          >
            <option value="video">فيديو</option>
            <option value="article">مقال</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClasses}>المصدر</span>
          <input
            required
            placeholder="YouTube / Dev.to"
            value={values.source}
            onChange={(e) => set("source", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className={labelClasses}>الرابط</span>
          <input
            required
            type="url"
            dir="ltr"
            placeholder="https://"
            value={values.url}
            onChange={(e) => set("url", e.target.value)}
            className={`${inputClasses} text-left`}
          />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className={labelClasses}>
            رابط الصورة المصغّرة (اختياري)
          </span>
          <input
            type="url"
            dir="ltr"
            placeholder="https://"
            value={values.thumbnailUrl}
            onChange={(e) => set("thumbnailUrl", e.target.value)}
            className={`${inputClasses} text-left`}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClasses}>مستوى الصعوبة</span>
          <select
            value={values.difficultyLevel}
            onChange={(e) => set("difficultyLevel", e.target.value)}
            className={inputClasses}
          >
            <option value="beginner">مبتدئ</option>
            <option value="intermediate">متوسط</option>
            <option value="advanced">متقدّم</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClasses}>
            المدة (دقائق)
          </span>
          <input
            required
            type="number"
            min={1}
            value={values.durationMinutes}
            onChange={(e) => set("durationMinutes", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className={labelClasses}>الموضوع</span>
          <select
            value={values.clusterId}
            onChange={(e) => set("clusterId", e.target.value)}
            className={inputClasses}
          >
            <option value="">بدون تصنيف</option>
            {clusters.map((cluster) => (
              <option key={cluster.id} value={cluster.id}>
                {cluster.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3.5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-teal bg-teal px-7 py-3 text-[15px] font-medium text-white transition-colors hover:border-teal-deep hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "جارٍ الحفظ..." : mode === "create" ? "إضافة" : "حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}
