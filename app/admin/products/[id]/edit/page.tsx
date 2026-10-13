import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { fetchAdminProduct } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params
}: {
  params: { id: string };
}) {
  const product = await fetchAdminProduct(params.id);
  if (!product) notFound();
  return <ProductForm product={product} />;
}
