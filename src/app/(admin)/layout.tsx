import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!["admin", "superadmin", "supplier"].includes(session.user.role)) redirect("/home");
  return <AdminLayout user={session.user}>{children}</AdminLayout>;
}
