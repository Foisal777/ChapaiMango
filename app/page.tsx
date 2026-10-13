import Hero from "@/components/home/Hero";
import FeaturedMangoes from "@/components/home/FeaturedMangoes";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";
import RotatingHighlights from "@/components/promo/RotatingHighlights";
import SocialFollow from "@/components/social/SocialFollow";
import JsonLd from "@/components/seo/JsonLd";
import Reveal from "@/components/motion/Reveal";
import { getProducts, getTestimonials } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 3600;

export default async function HomePage() {
  const [products, testimonials] = await Promise.all([
    getProducts(),
    getTestimonials()
  ]);
  const featured = products.filter((p) => p.is_featured);
  const siteUrl = getSiteUrl();
  const settings = await getSiteSettings();
  const { brand, contact, social } = settings;

  // Organization markup — tells Google "this is a brand", drives the
  // sitelinks search box and the brand panel on the right of search.
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    alternateName: brand.nameBn,
    url: siteUrl,
    logo: `${siteUrl}/icon`,
    description: brand.longDescription,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address,
      addressLocality: "নাচোল",
      addressRegion: "চাঁপাইনবাবগঞ্জ",
      addressCountry: "BD"
    },
    sameAs: [
      social.facebook,
      social.tiktok,
      social.instagram,
      social.youtube
    ].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      // Skip the "+880 1XXX-XXXXXX" placeholder so Google never indexes it.
      telephone: contact.phone.includes("XXX") ? undefined : contact.phone,
      contactType: "customer service",
      email: contact.email,
      availableLanguage: ["Bengali", "English"]
    }
  };

  // WebSite markup — enables the Google sitelinks search box if our
  // domain ever earns enough authority.
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brand.name,
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
      <Reveal>
        <FeaturedMangoes products={featured.length ? featured : products} />
      </Reveal>
      <Reveal>
        <WhyChooseUs />
      </Reveal>
      {/* Real customer reviews. Hidden until we have at least one
          approved review with rating >=4 and a non-trivial body, so
          the brand never shows an empty "What people are saying"
          card in production. submitReviewAction in app/actions/reviews.ts
          calls revalidatePath("/") so new reviews appear here on the
          next render. */}
      {testimonials.length > 0 && (
        <Reveal>
          <Testimonials testimonials={testimonials} />
        </Reveal>
      )}
      <Reveal>
        <SocialFollow />
      </Reveal>
      <Reveal>
        <CTA />
      </Reveal>
    </>
  );
}
