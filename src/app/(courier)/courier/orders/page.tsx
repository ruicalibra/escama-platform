import CourierOrders from "@/components/CourierOrders";
import { auth } from "@/lib/auth";
export const metadata = { title: "As Minhas Entregas — Escama" };
export default async function CourierPage() {
  const session = await auth();
  return <CourierOrders courierId={session!.user.id} />;
}
