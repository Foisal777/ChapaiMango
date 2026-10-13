import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Order, Mango, RefundPolicy, TeamMember } from "@/types";

export type AdminOrder = Order & { id: string; created_at: string };
export type AdminProduct = Mango;
export type AdminMessage = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  created_at: string;
};

const REVENUE_STATUSES = ["confirmed", "shipped", "delivered"];

export async function fetchAdminStats() {
  if (!isSupabaseConfigured()) {
    return {
      configured: false as const,
      totalOrders: 0,
      pendingOrders: 0,
      revenue: 0,
      totalProducts: 0,
      totalMessages: 0,
      recentOrders: [] as AdminOrder[]
    };
  }

  const supabase = createClient();

  const [ordersRes, productsRes, messagesRes, recentRes] = await Promise.all([
    supabase.from("orders").select("status,total"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  const orders = (ordersRes.data || []) as { status: string; total: number }[];
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const revenue = orders
    .filter((o) => REVENUE_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  return {
    configured: true as const,
    totalOrders,
    pendingOrders,
    revenue,
    totalProducts: productsRes.count || 0,
    totalMessages: messagesRes.count || 0,
    recentOrders: (recentRes.data || []) as AdminOrder[]
  };
}

export async function fetchAdminOrders(status?: string) {
  if (!isSupabaseConfigured()) return [] as AdminOrder[];
  const supabase = createClient();
  let q = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (status && status !== "all") {
    q = q.eq("status", status);
  }
  const { data } = await q;
  return (data || []) as AdminOrder[];
}

export async function fetchAdminOrder(id: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data || null) as AdminOrder | null;
}

export async function fetchAdminProducts() {
  if (!isSupabaseConfigured()) return [] as AdminProduct[];
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("name");
  return (data || []) as AdminProduct[];
}

export async function fetchAdminProduct(id: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data || null) as AdminProduct | null;
}

export async function fetchAdminMessages() {
  if (!isSupabaseConfigured()) return [] as AdminMessage[];
  const supabase = createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  return (data || []) as AdminMessage[];
}



// ----- Reviews -----

export type AdminReview = {
  id: string;
  product_id: string;
  product_name?: string;
  product_slug?: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  is_approved: boolean;
  created_at: string;
};

export async function fetchAdminReviews() {
  if (!isSupabaseConfigured()) return [] as AdminReview[];
  const supabase = createClient();
  // Hand-rolled join: pull reviews + a tiny products lookup so the admin
  // page can show "নাম (slug)" without a second round-trip per row.
  const { data: reviews } = await supabase
    .from("product_reviews")
    .select("*")
    .order("created_at", { ascending: false });
  const list = (reviews || []) as AdminReview[];
  if (list.length === 0) return list;

  const ids = Array.from(new Set(list.map((r) => r.product_id)));
  const { data: products } = await supabase
    .from("products")
    .select("id,name,slug")
    .in("id", ids);
  const byId = new Map(
    (products || []).map((p: { id: string; name: string; slug: string }) => [
      p.id,
      p
    ])
  );
  return list.map((r) => ({
    ...r,
    product_name: byId.get(r.product_id)?.name,
    product_slug: byId.get(r.product_id)?.slug
  }));
}

// ----- Push subscribers -----

export async function fetchPushSubscriberCount() {
  if (!isSupabaseConfigured()) return 0;
  const supabase = createClient();
  const { count } = await supabase
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true });
  return count || 0;
}



// ----- Marquee items -----

export type AdminMarquee = {
  id: string;
  emoji: string;
  text: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export async function fetchAdminMarquees() {
  if (!isSupabaseConfigured()) return [] as AdminMarquee[];
  const supabase = createClient();
  const { data } = await supabase
    .from("marquee_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data || []) as AdminMarquee[];
}



// ----- Team members -----

export type AdminTeamMember = TeamMember;

export async function fetchAdminTeamMembers() {
  if (!isSupabaseConfigured()) return [] as AdminTeamMember[];
  const supabase = createClient();
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data || []) as AdminTeamMember[];
}


// ----- Refund policy (admin) -----

export async function fetchRefundPolicy(): Promise<RefundPolicy | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from("refund_policy")
    .select("body_md, updated_at")
    .eq("id", 1)
    .maybeSingle();
  if (!data) return null;
  return {
    body_md: data.body_md || "",
    updated_at: data.updated_at || ""
  };
}
