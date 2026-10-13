/**
 * Tiny helper for embedding schema.org JSON-LD into a page.
 *
 * Usage:
 *   <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", ... }} />
 *
 * Server-safe (no client JS). Output is a single <script type="application/ld+json">.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // schema.org JSON-LD is, by spec, raw JSON inside a script tag.
      // dangerouslySetInnerHTML is the Next.js-recommended way to do this.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
