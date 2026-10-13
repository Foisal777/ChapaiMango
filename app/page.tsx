import Hero from "@/components/home/Hero";
import FeaturedMangoes from "@/components/home/FeaturedMangoes";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";
import RotatingHighlights from "@/components/promo/RotatingHighlights";
import SocialFollow from "@/components/social/SocialFollow";
import JsonLd from "@/components/seo/JsonLd";
import { getProducts, getTestimonials } from "@/lib/data";
import { getSiteUrl, SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function HomePage() {
  const [products, testimonials] = await Promise.all([
    getProducts(),
    getTestimonials()
  ]);
  const featured = products.filter((p) => p.is_featured);
  const siteUrl = getSiteUrl();

  // Organization markup — tells Google "this is a brand", drives the
  // sitelinks search box and the brand panel on the right of search.
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    alternateName: SITE.nameBn,
    url: siteUrl,
    logo: `${siteUrl}/opengraph-image`,
    description: SITE.longDescription,
    address: {
      "@type": "PostalAddress",
      streetAddress: "নিজামপুর",
      addressLocality: "নাচোল",
      addressRegion: "চাঁপাইনবাবগঞ্জ",
      addressCountry: "BD"
    },
    sameAs: [
      process.env.NEXT_PUBLIC_FACEBOOK_URL,
      process.env.NEXT_PUBLIC_TIKTOK_URL
    ].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: process.env.NEXT_PUBLIC_BUSINESS_PHONE,
      contactType: "customer service",
      email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL,
      availableLanguage: ["Bengali", "English"]
    }
  };

  // WebSite markup — enables the Google sitelinks search box if our
  // domain ever earns enough authority.
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: siteUrl,
    inLanguage: "bn-BD",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <Hero heroImages={products.flatMap((p) => p.images).slice(0, 6)} />
      <RotatingHighlights />
      <FeaturedMangoes products={featured.length ? featured : products} />
      <WhyChooseUs />
      {/* Real customer reviews. Hidden until we have at least one
          approved review with rating >=4 and a non-trivial body, so
          the brand never shows an empty "What people are saying"
          card in production. submitReviewAction in app/actions/reviews.ts
          calls revalidatePath("/") so new reviews appear here on the
          next render. */}
      {testimonials.length > 0 && (
        <Testimonials testimonials={testimonials} />
      )}
      <SocialFollow />
      <CTA />
    </>
  );
}
