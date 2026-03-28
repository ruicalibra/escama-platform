import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role === "admin" || role === "superadmin") redirect("/admin/dashboard");
  if (role === "courier") redirect("/courier/orders");
  if (role === "supplier") redirect("/admin/stock");
  redirect("/home");
}
