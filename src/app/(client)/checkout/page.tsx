import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CheckoutScreen from "@/components/client/CheckoutScreen";
export default async function CheckoutPage() {
  const session = await auth();
  if (!session) redirect("/login");
  return <CheckoutScreen />;
}
