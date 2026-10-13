import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Star, Package } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DeleteProductButton from "./DeleteProductButton";
import { fetchAdminProducts } from "@/lib/admin/data";
import { formatBDT } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await fetchAdminProducts();

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${products.length} variety / item${products.length === 1 ? "" : "s"}`}
        actions={
          <Link href="/admin/products/new" className="btn-primary text-sm py-2.5">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        }
      />

      {products.length === 0 ? (
        <div className="glass rounded-2xl p-14 text-center">
          <Package className="h-14 w-14 mx-auto text-mango-400" />
          <p className="mt-3 font-display text-lg">Akhono kono product nei</p>
          <p className="text-sm text-ink/50 mt-1">
            Prothom aam ta add korun.
          </p>
          <Link
            href="/admin/products/new"
            className="btn-primary mt-5 inline-flex"
          >
            <Plus className="h-4 w-4" /> Add product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((p) => (
            <div
              key={p.id}
              className="glass rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[5/3] bg-mango-100">
                {p.images?.[0] ? (
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    sizes="(max-width:640px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid place-items-center h-full text-5xl">
                    🥭
                  </div>
                )}
                {p.is_featured && (
                  <span className="absolute top-2 left-2 rounded-full bg-mango-gradient px-2.5 py-0.5 text-[10px] font-bold text-ink shadow-glow">
                    Featured
                  </span>
                )}
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-mango-700">
                  <Star className="h-3 w-3 fill-mango-500 text-mango-500" />
                  {Number(p.rating).toFixed(1)}
                </span>
              </div>

              <div className="flex-1 flex flex-col p-4">
                <div className="text-[10px] uppercase tracking-wider text-mango-600 font-semibold">
                  {p.variety}
                </div>
                <h3 className="font-display text-base font-bold mt-0.5 line-clamp-1">
                  {p.name}
                </h3>
                <p className="text-xs text-ink/50 mt-1 line-clamp-2">
                  {p.short_description}
                </p>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="font-display text-lg font-bold text-mango-700">
                      {formatBDT(Number(p.price_per_kg))}
                    </div>
                    <div className="text-[10px] text-ink/50">per kg</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-ink">
                      {Number(p.stock_kg)} kg
                    </div>
                    <div className="text-[10px] text-ink/50">in stock</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-mango-300 bg-white px-3 py-2 text-xs font-semibold text-mango-700 hover:bg-mango-100 transition"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <DeleteProductButton id={p.id} name={p.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
