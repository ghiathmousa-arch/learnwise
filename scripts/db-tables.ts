// وصف الجداول بترتيب المفاتيح الأجنبية (الأب قبل الابن) + أنواع الأعمدة
// يلي بتحتاج تحويل وقت النقل من SQLite لـ Postgres.
export type TableSpec = {
  name: string;
  /** أعمدة مخزّنة كنص JSON بـ SQLite ولازم تصير JSONB بـ Postgres */
  json: string[];
  /** أعمدة تاريخ مخزّنة كنص ISO ولازم تصير Date */
  dates: string[];
  /** أعمدة منطقية مخزّنة كـ 0/1 */
  booleans: string[];
  /** فيه عمود id تسلسلي لازم نصحّح الـ sequence تبعو بعد الاستيراد */
  serial: boolean;
};

export const TABLES: TableSpec[] = [
  { name: "User", json: ["initialEmbedding", "currentEmbedding"], dates: ["createdAt"], booleans: [], serial: true },
  { name: "Admin", json: [], dates: ["createdAt"], booleans: [], serial: true },
  { name: "Cluster", json: ["centroidEmbedding"], dates: [], booleans: [], serial: true },
  { name: "Content", json: ["embedding"], dates: ["createdAt"], booleans: [], serial: true },
  { name: "UserCluster", json: [], dates: [], booleans: [], serial: false },
  { name: "ViewHistory", json: [], dates: ["viewedAt"], booleans: [], serial: true },
  { name: "SearchHistory", json: [], dates: ["searchedAt"], booleans: [], serial: true },
  { name: "LoginLog", json: [], dates: ["loginAt"], booleans: [], serial: true },
  { name: "SuggestedDomain", json: [], dates: ["submittedAt"], booleans: [], serial: true },
  { name: "ContactMessage", json: [], dates: ["submittedAt"], booleans: ["isRead"], serial: true },
];
