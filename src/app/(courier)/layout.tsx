import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CourierLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!["courier", "admin", "superadmin"].includes(session.user.role)) redirect("/home");
  return (
    <div className="min-h-screen bg-[#0F1623] text-[#E8EDF5]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {children}
    </div>
  );
}
