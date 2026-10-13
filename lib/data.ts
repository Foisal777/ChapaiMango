import type {
  MarqueeItem,
  Mango,
  ProductRatingStats,
  ProductReview,
  RefundPolicy,
  TeamMember,
  Testimonial
} from "@/types";

const ORIGIN = "নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, বাংলাদেশ";

/**
 * Fallback data used when Supabase env vars are not yet configured.
 * Same data is also seeded into Supabase via supabase/schema.sql.
 */
export const MOCK_PRODUCTS: Mango[] = [
  {
    id: "1",
    name: "প্রিমিয়াম হিমসাগর",
    slug: "himsagar",
    variety: "Himsagar",
    price_per_kg: 180,
    stock_kg: 500,
    images: [
      "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=1200",
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=1200"
    ],
    short_description: "বাংলা আমের রাজা — মিষ্টি, রসালো, সুগন্ধি।",
    description:
      "চাঁপাইনবাবগঞ্জের গাছপাকা হিমসাগর। আঁশহীন মসৃণ শাঁস, কম শাঁসে অসাধারণ মিষ্টি স্বাদ। একবার খেলে বারবার মনে পড়বে।",
    is_featured: true,
    rating: 4.9,
    origin: ORIGIN,
    season: "মে – জুন"
  },
  {
    id: "2",
    name: "ল্যাংড়া (বানারসি)",
    slug: "langra",
    variety: "Langra",
    price_per_kg: 200,
    stock_kg: 400,
    images: ["https://images.unsplash.com/photo-1553279768-865429fa0078?w=1200"],
    short_description: "সবুজ-সোনালি রঙ, অসাধারণ মিষ্টি আম।",
    description:
      "বানারসি হেরিটেজ জাত — পাতলা খোসা, মাখনের মতো নরম শাঁস। চাঁপাইয়ের মাটি ও আবহাওয়ায় ল্যাংড়া দুনিয়াবিখ্যাত।",
    is_featured: true,
    rating: 4.8,
    origin: ORIGIN,
    season: "জুন – জুলাই"
  },
  {
    id: "3",
    name: "ক্ষীরসাপাত",
    slug: "khirsapat",
    variety: "Khirsapat",
    price_per_kg: 220,
    stock_kg: 350,
    images: [
      "https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=1200"
    ],
    short_description: "GI ট্যাগ পাওয়া চাঁপাইয়ের গৌরব।",
    description:
      "Geographical Indication (GI) নিবন্ধিত ক্ষীরসাপাত — সংরক্ষিত ঐতিহ্য। অত্যন্ত মিষ্টি, হলুদ মাখনের মতো শাঁস, ফাইবার-মুক্ত।",
    is_featured: true,
    rating: 5.0,
    origin: ORIGIN,
    season: "মে – জুলাই"
  },
  {
    id: "4",
    name: "ফজলি",
    slug: "fazli",
    variety: "Fazli",
    price_per_kg: 150,
    stock_kg: 600,
    images: [
      "https://images.unsplash.com/photo-1596591868231-05e808fd5ec2?w=1200"
    ],
    short_description: "বড় সাইজ, লেট সিজন — আচার ও ক্ষীরের জন্য সেরা।",
    description:
      "প্রতি ফল ৭০০গ্রাম–১.২ কেজি। লেট-সিজন আম (জুলাই–আগস্ট)। আচার, জ্যাম, ও পাকা খাওয়ার জন্য চমৎকার।",
    is_featured: false,
    rating: 4.6,
    origin: ORIGIN,
    season: "জুলাই – আগস্ট"
  },
  {
    id: "5",
    name: "আম্রপালি",
    slug: "amrapali",
    variety: "Amrapali",
    price_per_kg: 170,
    stock_kg: 450,
    images: [
      "https://images.unsplash.com/photo-1631534179872-2b7a577b1ba2?w=1200"
    ],
    short_description: "হাইব্রিড জাত — ছোট, ঘন মিষ্টি, ফাইবার-মুক্ত।",
    description:
      "দশেহারি + নিলাম-এর হাইব্রিড। অত্যন্ত মিষ্টি, ফাইবার কম, লাল-হলুদ রঙ। ছোট পরিবারের জন্য পারফেক্ট।",
    is_featured: false,
    rating: 4.7,
    origin: ORIGIN,
    season: "জুন – জুলাই"
  },
  {
    id: "6",
    name: "গোপালভোগ",
    slug: "gopalbhog",
    variety: "Gopalbhog",
    price_per_kg: 160,
    stock_kg: 300,
    images: [
      "https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=1200"
    ],
    short_description: "সিজনের প্রথম আম — মে মাসের শুরুতেই পাবেন।",
    description:
      "মৌসুমের প্রথম আম। চামড়া পাতলা, সুগন্ধে ভরা, মিষ্টি-টক ব্যালান্স। রমজান/ঈদের প্রিয় আম।",
    is_featured: false,
    rating: 4.5,
    origin: ORIGIN,
    season: "মে"
  }
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "রাশেদ খান",
    location: "ঢাকা",
    message:
      "অনেক দিন পর এত ফ্রেশ আম পেলাম। প্যাকেজিং একদম সেফ, একটাও নষ্ট হয়নি। ইনশাআল্লাহ আবার অর্ডার করব।",
    rating: 5
  },
  {
    id: "t2",
    name: "নুসরাত জাহান",
    location: "চট্টগ্রাম",
    message:
      "ক্ষীরসাপাতের স্বাদ একদম চাঁপাইয়ের মতো — যত দিন থাকব Chapai Mango House থেকেই নেব।",
    rating: 5
  },
  {
    id: "t3",
    name: "তানভীর আহমেদ",
    location: "সিলেট",
    message:
      "দাম রিজনেবল, ডেলিভারি ফাস্ট। পরিবারের জন্য গিফট হিসেবে পাঠিয়েছিলাম, সবাই খুশি।",
    rating: 5
  }
];

/** Try Supabase first, fall back to mock data. */
export async function getProducts(): Promise<Mango[]> {
  try {
    const { isSupabaseConfigured, createClient } = await import(
      "@/lib/supabase/server"
    );
    if (!isSupabaseConfigured()) return MOCK_PRODUCTS;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("is_featured", { ascending: false });
    if (error || !data || data.length === 0) return MOCK_PRODUCTS;
    return data as Mango[];
  } catch {
    return MOCK_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Mango | null> {
  try {
    const { isSupabaseConfigured, createClient } = await import(
      "@/lib/supabase/server"
    );
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (data) return data as Mango;
    }
  } catch {
    /* fall through */
  }
  return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

/**
 * Customer testimonials shown on the home page.
 *
 * Source of truth is now the `product_reviews` table — the same
 * reviews customers post on /products/[slug]. As soon as a review is
 * approved, the home page re-validates and the new feedback appears
 * here automatically. We never store hand-curated testimonials any
 * more — what you see is what real customers said.
 *
 * Filtering rules (kept conservative so the home strip stays
 * presentable even with a small review pool):
 *   - is_approved = true (admin gate)
 *   - rating >= 4 (positive only — the home page is brand surface)
 *   - body length >= 30 chars (one-word reviews look bad in cards)
 *   - newest first, take 6 (Testimonials component shows 3 anyway)
 *
 * The legacy `testimonials` table query is gone. MOCK_TESTIMONIALS
 * is still kept as a dev-only fallback for when Supabase isn't
 * configured — in production (where Supabase IS configured but the
 * shop is brand new and has no reviews yet) we return an empty
 * array, and the home page hides the section entirely.
 */
type ReviewWithProduct = {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  created_at: string;
  product: { name: string; slug: string } | null;
};

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const { isSupabaseConfigured, createClient } = await import(
      "@/lib/supabase/server"
    );
    // Dev / unconfigured — show the mock so the section isn't empty.
    if (!isSupabaseConfigured()) return MOCK_TESTIMONIALS;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("product_reviews")
      .select(
        "id, author_name, rating, body, created_at, product:products(name, slug)"
      )
      .eq("is_approved", true)
      .gte("rating", 4)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error || !data) return [];

    const rows = data as unknown as ReviewWithProduct[];
    return rows
      .filter((r) => (r.body || "").trim().length >= 30)
      .slice(0, 6)
      .map((r) => ({
        id: r.id,
        name: r.author_name || "গ্রাহক",
        // Show the product the review is for as the secondary line —
        // works as a "verified buyer of X" social-proof signal.
        location: r.product?.name
          ? `${r.product.name} এর গ্রাহক`
          : "যাচাইকৃত গ্রাহক",
        message: r.body,
        rating: Math.max(1, Math.min(5, Math.round(r.rating)))
      }));
  } catch {
    // Network / RLS hiccup — fail closed (empty), home page hides the section.
    return [];
  }
}



/**
 * Public-readable approved reviews for a product, newest first.
 * Falls back to an empty list when Supabase is not configured (so the
 * product page still renders cleanly in dev).
 */
export async function getProductReviews(
  productId: string,
  limit = 50
): Promise<ProductReview[]> {
  try {
    const { isSupabaseConfigured, createClient } = await import(
      "@/lib/supabase/server"
    );
    if (!isSupabaseConfigured()) return [];
    const supabase = createClient();
    const { data } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data || []) as ProductReview[];
  } catch {
    return [];
  }
}

/**
 * Aggregate rating stats for a single product.
 *
 * The `recompute_product_rating` trigger keeps `products.rating` and
 * `products.review_count` in sync with the underlying reviews, so we
 * just read those columns. When `review_count` is 0 the average is
 * still meaningful (it's the seed rating set by the admin) but we
 * surface 0 as the count so the JSON-LD on the product page can decide
 * whether to omit the AggregateRating block (Google requires count > 0
 * to render rich-result stars).
 */
export async function getProductRatingStats(
  productId: string
): Promise<ProductRatingStats> {
  try {
    const { isSupabaseConfigured, createClient } = await import(
      "@/lib/supabase/server"
    );
    if (!isSupabaseConfigured()) return { average: 5, count: 0 };
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select("rating, review_count")
      .eq("id", productId)
      .maybeSingle();
    return {
      average: Number(data?.rating ?? 5),
      count: Number(data?.review_count ?? 0)
    };
  } catch {
    return { average: 5, count: 0 };
  }
}



/** Built-in fallback list. Used in dev / when Supabase is unreachable
 *  so the marquee never goes blank. Same six items the migration seeds. */
const MOCK_MARQUEES: MarqueeItem[] = [
  {
    id: "m1",
    emoji: "🚚",
    text: "সারাদেশে ফ্রী ডেলিভারি",
    is_active: true,
    sort_order: 10,
    created_at: ""
  },
  {
    id: "m2",
    emoji: "🥭",
    text: "চাঁপাইনবাবগঞ্জের প্রিমিয়াম আম",
    is_active: true,
    sort_order: 20,
    created_at: ""
  },
  {
    id: "m3",
    emoji: "✨",
    text: "১০০% গাছপাকা, কেমিক্যাল-মুক্ত",
    is_active: true,
    sort_order: 30,
    created_at: ""
  },
  {
    id: "m4",
    emoji: "📦",
    text: "ন্যূনতম অর্ডার ১০ কেজি",
    is_active: true,
    sort_order: 40,
    created_at: ""
  },
  {
    id: "m5",
    emoji: "🏆",
    text: "GI ট্যাগ পাওয়া ক্ষীরসাপাত",
    is_active: true,
    sort_order: 50,
    created_at: ""
  },
  {
    id: "m6",
    emoji: "🏡",
    text: "সরাসরি বাগান থেকে আপনার দরজায়",
    is_active: true,
    sort_order: 60,
    created_at: ""
  }
];

/**
 * Active marquee items, ordered by sort_order, for the public top
 * promo strip. Falls back to MOCK_MARQUEES when Supabase isn't
 * configured or returns no rows so the strip never renders empty.
 */
export async function getActiveMarquees(): Promise<MarqueeItem[]> {
  try {
    const { isSupabaseConfigured, createClient } = await import(
      "@/lib/supabase/server"
    );
    if (!isSupabaseConfigured()) return MOCK_MARQUEES;
    const supabase = createClient();
    const { data } = await supabase
      .from("marquee_items")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (!data || data.length === 0) return MOCK_MARQUEES;
    return data as MarqueeItem[];
  } catch {
    return MOCK_MARQUEES;
  }
}



// ----- Team members -----

const MOCK_TEAM: TeamMember[] = [
  {
    id: "tm1",
    name: "MD FOISAL IQBAL",
    role: "founder",
    title: "প্রতিষ্ঠাতা ও পরিচালক",
    bio: "তিন প্রজন্মের আম-চাষি পরিবারের সন্তান। চাঁপাইনবাবগঞ্জের ঐতিহ্যকে সারা দেশে পৌঁছে দেওয়ার লক্ষ্যেই Chapai Mango House।",
    photo_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
    phone: null,
    email: null,
    facebook_url: null,
    sort_order: 10,
    is_active: true,
    created_at: ""
  },
  {
    id: "tm2",
    name: "নাচোলের আম সরবরাহকারী দল",
    role: "supplier",
    title: "বাগান অংশীদার",
    bio: "নিজামপুর, নাচোলের অভিজ্ঞ আম-চাষিরা — গাছপাকা, কেমিক্যাল-মুক্ত আম সংগ্রহের দায়িত্বে।",
    photo_url:
      "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=600",
    phone: null,
    email: null,
    facebook_url: null,
    sort_order: 20,
    is_active: true,
    created_at: ""
  },
  {
    id: "tm3",
    name: "ডেলিভারি ও সাপোর্ট টিম",
    role: "member",
    title: "কাস্টমার কেয়ার",
    bio: "আপনার অর্ডার সঠিক সময়ে, নিরাপদে পৌঁছে দিতে দিন-রাত কাজ করে আমাদের ডেলিভারি ও সাপোর্ট টিম।",
    photo_url:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600",
    phone: null,
    email: null,
    facebook_url: null,
    sort_order: 30,
    is_active: true,
    created_at: ""
  }
];

/**
 * Active team members shown on the public /team page, ordered by
 * (role priority, sort_order). Falls back to MOCK_TEAM in dev / when
 * Supabase isn't configured so the page never renders empty.
 *
 * Role display priority is enforced on the page itself (founders
 * first, then suppliers, then members), but we still order by
 * sort_order inside each role so the operator can rearrange.
 */
export async function getActiveTeamMembers(): Promise<TeamMember[]> {
  try {
    const { isSupabaseConfigured, createClient } = await import(
      "@/lib/supabase/server"
    );
    if (!isSupabaseConfigured()) return MOCK_TEAM;
    const supabase = createClient();
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (!data || data.length === 0) return MOCK_TEAM;
    return data as TeamMember[];
  } catch {
    return MOCK_TEAM;
  }
}


// ----- Refund policy -----

const MOCK_REFUND_POLICY: RefundPolicy = {
  body_md:
    "## রিফান্ড ও রিটার্ন পলিসি\n\n" +
    "এই পেজটি admin panel থেকে এডিট করুন। পণ্য পাওয়ার ২৪ ঘণ্টার " +
    "মধ্যে অভিযোগ জানালে আমরা যাচাই করে রিফান্ড / রিপ্লেসমেন্ট দিয়ে " +
    "থাকি — বিস্তারিত জানতে কন্ট্যাক্ট পেজে যোগাযোগ করুন।",
  updated_at: ""
};

export async function getRefundPolicy(): Promise<RefundPolicy> {
  try {
    const { isSupabaseConfigured, createClient } = await import(
      "@/lib/supabase/server"
    );
    if (!isSupabaseConfigured()) return MOCK_REFUND_POLICY;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("refund_policy")
      .select("body_md, updated_at")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return MOCK_REFUND_POLICY;
    return {
      body_md: data.body_md || MOCK_REFUND_POLICY.body_md,
      updated_at: data.updated_at || ""
    };
  } catch {
    return MOCK_REFUND_POLICY;
  }
}
