import ProductDetailScreen from "@/components/client/ProductDetailScreen";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailScreen productId={id} />;
}
