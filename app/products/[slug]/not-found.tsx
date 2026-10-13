import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export default function NotFound() {
  const d = getDictionary(getLocale());
  return (
    <section className="container-x py-24 text-center">
      <div className="text-7xl mb-4">🥭</div>
      <h1 className="font-display-bn text-3xl sm:text-4xl font-bold">
        {d.misc.notFoundTitle}
      </h1>
      <p className="mt-2 text-ink/60">
        {d.misc.notFoundMsg}
      </p>
      <Link href="/products" className="btn-primary mt-6 inline-flex">
        {d.common.backToShop}
      </Link>
    </section>
  );
}
