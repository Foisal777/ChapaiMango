/**
 * Route-level loading UI. Next.js streams this instantly while a page's
 * server data is fetched, so every navigation paints something right away
 * instead of a blank screen. Height/layout roughly matches a content page
 * to keep CLS low.
 */
export default function Loading() {
  return (
    <div className="container-x py-16 animate-pulse" aria-busy="true" aria-label="লোড হচ্ছে">
      <div className="h-4 w-24 rounded-full bg-mango-200/70" />
      <div className="mt-4 h-10 w-2/3 max-w-xl rounded-2xl bg-mango-200/70" />
      <div className="mt-3 h-4 w-1/2 max-w-md rounded-full bg-mango-100" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-3xl p-4">
            <div className="aspect-square rounded-2xl bg-mango-100" />
            <div className="mt-4 h-5 w-3/4 rounded-full bg-mango-200/70" />
            <div className="mt-2 h-4 w-1/2 rounded-full bg-mango-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
