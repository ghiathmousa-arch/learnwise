import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/adminAuth";

export default async function AdminRootPage() {
  const admin = await getCurrentAdmin();
  redirect(admin ? "/admin/dashboard" : "/admin/login");
}
