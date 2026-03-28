import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileScreen from "@/components/client/ProfileScreen";
export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");
  return <ProfileScreen user={session.user} />;
}
