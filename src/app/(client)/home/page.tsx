import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import HomeScreen from "@/components/client/HomeScreen";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/login");
  return <HomeScreen user={session.user} />;
}
