import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x py-24 text-center">
      <div className="text-7xl mb-4">🥭</div>
      <h1 className="font-display-bn text-3xl sm:text-4xl font-bold">
        আমটি খুঁজে পাইনি
      </h1>
      <p className="mt-2 text-ink/60">
        এই পণ্যটি এখনো নেই অথবা লিঙ্কে কিছু ভুল আছে।
      </p>
      <Link href="/products" className="btn-primary mt-6 inline-flex">
        শপে ফিরে যান
      </Link>
    </section>
  );
}
