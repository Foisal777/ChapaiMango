# 🥭 Chapai Mango

A premium full-stack e-commerce site for selling **Chapainawabganj-er gachpaka aam** online.

Built with **Next.js 14**, **Supabase**, **Tailwind CSS**, **React Three Fiber** (3D hero), **Framer Motion** & **Zustand**. One-click deploy to **Railway** (or Vercel).

---

## ✨ Features

- 🥭 **5 polished pages** — Home, Shop, Product detail, About, Contact (+ Cart & Checkout)
- 🎨 **3D rotating mango** hero (React Three Fiber, no external assets)
- 🛒 **Cart** persisted to `localStorage` (Zustand)
- 💳 **Manual MFS payment** — Cash on Delivery + **bKash / Nagad / Rocket** with TrxID capture
- 🗄️ **Supabase** — products, orders, testimonials, contact messages
- 🪄 **Mock data fallback** — site works locally even before Supabase is wired up
- 📱 Fully responsive · animated · SEO-friendly · BDT formatting
- ⚡ Auto-deploy from GitHub → Railway / Vercel

---

## 🚀 Quick Start (Local)

```bash
# 1. Install deps
npm install

# 2. Copy env example
cp .env.local.example .env.local
# (you can leave Supabase keys blank for now — site uses mock data)

# 3. Run dev server
npm run dev
```

Open <http://localhost:3000>.

---

## 🗄️ Supabase Setup (5 minutes)

### 1. Create a project
1. Go to <https://supabase.com> → **New project**
2. Name it `chapai-mango`, pick a region (Singapore is closest to BD)
3. Save the password somewhere safe

### 2. Run the schema
1. Open **SQL Editor** in Supabase dashboard
2. Click **New query**
3. Copy contents of [`supabase/schema.sql`](./supabase/schema.sql) and **Run**
4. ✅ Tables created + RLS enabled + 6 mangoes + 3 testimonials seeded

### 3. Grab API keys
1. **Settings → API** in Supabase
2. Copy `Project URL` and `anon public` key
3. Paste into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Restart `npm run dev` — the site will now read from Supabase.

---

## 💳 Payment Setup (bKash / Nagad / Rocket)

This site uses a **manual MFS flow** (no SSL Commerz / merchant integration needed):

1. Customer chooses bKash / Nagad / Rocket on checkout
2. Site shows **your personal/agent number** + total amount
3. Customer "Send Money" → enters **TrxID + sender number** in form
4. Order saved to Supabase with `status='pending'`
5. You verify the transaction in your bKash app, then update `status='confirmed'` from Supabase dashboard

### Configure your numbers

Edit `.env.local`:

```bash
NEXT_PUBLIC_BKASH_NUMBER=01XXXXXXXXX
NEXT_PUBLIC_NAGAD_NUMBER=01XXXXXXXXX
NEXT_PUBLIC_ROCKET_NUMBER=01XXXXXXXXX
NEXT_PUBLIC_BUSINESS_PHONE=01XXXXXXXXX
NEXT_PUBLIC_BUSINESS_EMAIL=hello@chapaimango.com
```

> 💡 Pore SSLCommerz / Stripe-er proper integration korte chaile, just `components/checkout/CheckoutForm.tsx`-er `onSubmit` handler change korle hobe.

---

## 📦 Manage Orders

Open Supabase → **Table Editor → `orders`**:

- `status='pending'` → new order, payment unverified
- Verify TrxID in bKash/Nagad/Rocket app
- Update to `confirmed` → `shipped` → `delivered`

You can also build an admin panel later at `/admin` (Supabase auth + service role).

---

## 🚂 Deploy to Railway (recommended, 5 minutes)

Railway uses **Nixpacks** to detect Next.js automatically. Config files in this repo (`railway.json`, `nixpacks.toml`) make the build deterministic and add a healthcheck.

### 1. Sign in
1. Go to <https://railway.com> → **Login**
2. **Continue with GitHub** → authorize

### 2. Create the project
1. Click **New Project** → **Deploy from GitHub repo**
2. Select **`Foisa590/Chapai_Mango`**
3. Railway detects Next.js + reads `railway.json` → starts an initial build
4. **Wait** — first build takes ~3-4 minutes (you'll see logs streaming)

### 3. Add environment variables
1. Open the service → **Variables** tab
2. Add each one (use the **Raw Editor** for bulk paste):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_BKASH_NUMBER=01XXXXXXXXX
NEXT_PUBLIC_NAGAD_NUMBER=01XXXXXXXXX
NEXT_PUBLIC_ROCKET_NUMBER=01XXXXXXXXX
NEXT_PUBLIC_BUSINESS_PHONE=01XXXXXXXXX
NEXT_PUBLIC_BUSINESS_EMAIL=hello@chapaimango.com
```

3. Save — Railway will auto-redeploy with the new variables

### 4. Generate a public URL
1. **Settings → Networking → Generate Domain**
2. Railway gives you `chapai-mango-production.up.railway.app` (or similar)
3. Open it → 🎉 your site is live

### 5. (Optional) Custom domain
1. **Settings → Networking → Custom Domain** → add `chapaimango.com`
2. Add the CNAME / A record Railway shows you in your DNS provider
3. Wait ~10 minutes — Railway provisions HTTPS automatically

### Health check
Railway pings `/api/health` every few seconds to confirm the app is alive. Endpoint defined in `app/api/health/route.ts` — always returns `{"status":"ok"}`.

> 💰 **Pricing note:** Railway gives a one-time **$5 trial credit** (no card needed) — enough to run this site for ~1 month while testing. After that, the **Hobby plan ($5/month, ~৳600)** is required and needs a card. If you want a permanently-free option, use Vercel instead (see below).

---

## ☁️ Deploy to Vercel (alternative, 3 minutes)

### 1. Push to GitHub
This repo is already at <https://github.com/Foisa590/Chapai_Mango>. Just commit & push your local changes.

### 2. Import on Vercel
1. Go to <https://vercel.com/new>
2. Click **Import** on `Chapai_Mango`
3. Framework: **Next.js** (auto-detected)
4. Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
| `NEXT_PUBLIC_BKASH_NUMBER` | your bKash number |
| `NEXT_PUBLIC_NAGAD_NUMBER` | your Nagad number |
| `NEXT_PUBLIC_ROCKET_NUMBER` | your Rocket number |
| `NEXT_PUBLIC_BUSINESS_PHONE` | your contact number |
| `NEXT_PUBLIC_BUSINESS_EMAIL` | your contact email |

5. Click **Deploy**. Done. 🎉

Future pushes to `main` auto-deploy.

### Custom Domain
Settings → Domains → add `chapaimango.com` (or whatever) → update DNS.

---

## 🗂️ Project Structure

```
Chapai_Mango/
├── app/
│   ├── layout.tsx              # Root layout (Navbar, Footer, Toaster)
│   ├── page.tsx                # Home
│   ├── products/
│   │   ├── page.tsx            # Shop listing
│   │   └── [slug]/page.tsx     # Detail
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   └── globals.css
├── components/
│   ├── 3d/                     # MangoMesh, Scene (R3F)
│   ├── home/                   # Hero, Featured, WhyChooseUs, Testimonials, CTA
│   ├── product/                # ProductCard, ProductsExplorer, Gallery, AddToCart
│   ├── cart/CartView.tsx
│   ├── checkout/CheckoutForm.tsx
│   ├── contact/ContactForm.tsx
│   └── layout/                 # Navbar, Footer
├── lib/
│   ├── supabase/               # client.ts, server.ts (SSR helpers)
│   ├── data.ts                 # Supabase + mock-fallback fetchers
│   └── utils.ts                # cn, formatBDT, slugify
├── store/cart-store.ts         # Zustand cart (persisted)
├── types/index.ts
├── supabase/schema.sql         # Run this in Supabase SQL Editor
└── .env.local.example
```

---

## 🎨 Customizing

| Want to… | Edit |
|---|---|
| Change colors / theme | `tailwind.config.ts` (mango palette) |
| Add a new mango variety | Insert row in Supabase `products` table |
| Update homepage copy | `components/home/*` |
| Change delivery fee / free threshold | `components/cart/CartView.tsx` & `components/checkout/CheckoutForm.tsx` (search `2000`) |
| Replace 3D mango with a real GLB | `components/3d/MangoMesh.tsx` → use `useGLTF` from drei |
| Add admin dashboard | Create `app/admin/` with Supabase auth + service role |

---

## 🛣️ Roadmap (next phases)

- [ ] Admin dashboard (`/admin`) with Supabase Auth
- [ ] Email/SMS notification on new order (Resend / SMS API)
- [ ] SSLCommerz integration for direct online payment
- [ ] Customer order tracking page (`/orders/[id]`)
- [ ] Product reviews & ratings (logged-in customers)
- [ ] Multi-language toggle (Bangla / English)

---

## 🧰 Tech Stack

| Category | Tool |
|----------|------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| 3D | React Three Fiber + Three.js + drei |
| Animation | Framer Motion |
| State | Zustand (persisted) |
| Forms | React Hook Form + Zod |
| Database / Auth | Supabase |
| Notifications | react-hot-toast |
| Icons | lucide-react |
| Deploy | Railway / Vercel |

---

## 📜 License

Private — © Chapai Mango. All rights reserved.


---

## 🛠️ Admin Dashboard

A full admin dashboard ships at **`/admin`** — protected by Supabase Auth.

### Features

| Section | URL | What you can do |
|---|---|---|
| Login | `/admin/login` | Email + password sign-in |
| Dashboard | `/admin` | Total orders, pending count, revenue, products, recent orders, quick actions |
| Orders | `/admin/orders` | Filter by status tabs (pending / confirmed / shipped / delivered / cancelled), table view |
| Order detail | `/admin/orders/[id]` | View customer info, items, payment + TrxID, change status, delete |
| Products | `/admin/products` | Card grid with image + price + stock, Edit, Delete |
| New product | `/admin/products/new` | Add a new mango variety (multi-image, featured toggle) |
| Edit product | `/admin/products/[id]/edit` | Update existing product |
| Messages | `/admin/messages` | Read contact-form submissions, click-to-reply via email/phone, delete |

The admin area uses its own sidebar layout (no public navbar) and is fully responsive — mobile sidebar opens via hamburger.

### Create your admin user

1. Open Supabase Dashboard → **Authentication → Users → Add user**
2. Choose **Create new user**
3. Email: `admin@chapaimango.com` (or whatever)
4. Password: a strong password
5. ✅ Check **Auto Confirm User**
6. Click **Create user**

> Need more than one admin? Just add more users the same way — anyone authenticated has admin access. RLS policies in `supabase/schema.sql` allow any authenticated user to manage everything.

### Re-running schema.sql for admin RLS

If you set up Supabase before this admin update, re-run [`supabase/schema.sql`](./supabase/schema.sql) (it's idempotent — `drop policy if exists` + `create policy`). The bottom block adds the admin policies that authorize logged-in users to update/delete orders, manage products, etc.

### Migrating existing seeded products to Bengali

The seed in `schema.sql` uses `ON CONFLICT (slug) DO NOTHING`, so re-running it does **not** translate already-inserted English rows. If your Supabase project still shows English product names like "Premium Himsagar" instead of "প্রিমিয়াম হিমসাগর", run the migration once:

1. Open Supabase **SQL Editor → New query**
2. Paste the contents of [`supabase/migrate-bangla.sql`](./supabase/migrate-bangla.sql)
3. Click **Run** — products + testimonials are translated, origin updated to Nijampur, Nachole

The script is safe to run multiple times.

### Sign in

1. Run the dev server (`npm run dev`)
2. Visit <http://localhost:3000/admin>
3. Middleware redirects you to `/admin/login`
4. Sign in with the email + password you created in Supabase
5. You'll land on the dashboard

---

## 👤 Customer Auth + Order History

Customers must now **sign up / sign in** before they can place an order, and they get a personal **order history page** at `/orders`.

### Pages

| URL | What |
|---|---|
| `/signup` | Create a customer account (full name, phone, email, password) |
| `/login` | Sign in with email + password (auto-redirects to `/orders` or `?next=`) |
| `/orders` | The signed-in customer's personal order history |

The navbar shows a **circular initial avatar** when signed in. Tapping it opens a menu with:
- আমার অর্ডার (My Orders)
- অ্যাডমিন প্যানেল (only visible if the user's email is in `admin_emails`)
- সাইন আউট (Sign out)

### Run the customer-auth migration (one-time)

1. **Supabase Dashboard → SQL Editor → + New query**
2. Paste the contents of [`supabase/customer-auth.sql`](./supabase/customer-auth.sql) and **Run**.
3. **Add your admin email** (without this, `/admin/*` will reject every login):

```sql
insert into public.admin_emails (email)
values ('your-admin@email.com')   -- ⬅️ replace with your real admin email
on conflict do nothing;
```

The script:
- Adds a `user_id` column to `orders` linking each order to a Supabase Auth user
- Creates an `admin_emails` whitelist + `is_admin()` helper function
- Replaces the old "anyone can insert" policies with auth-required policies:
  - **Customer:** can insert and read **only their own** orders
  - **Admin (whitelisted email):** full read/update/delete access
- Tightens `contact_messages`: anyone can submit, only admin can read/manage

### How the flow now works

1. Customer hits **Checkout** → middleware redirects to `/login` if not signed in
2. Customer signs up at `/signup` (or signs in) → returns to checkout
3. Order insert sets `user_id = auth.uid()` so it ties to the customer
4. After "অর্ডার কনফার্ম!" the customer can visit `/orders` to see history
5. Admin still uses `/admin/login` and lands at `/admin` for the dashboard

### Disabling email confirmation (recommended for low-friction signup)

By default Supabase requires email confirmation before a new user can sign in. To let customers order immediately after signup:

1. Supabase Dashboard → **Authentication → Providers → Email**
2. Turn **off** "Confirm email"
3. Save

(If you want to keep confirmation on for security, the signup form already shows a "check your inbox" message instead of redirecting.)

### Phone OR Email signup/login (both supported!)

Customers can sign up and sign in with **either** their phone number **or** an email address. The forms have a toggle at the top — তোগ্‌ল-এ "ফোন" / "ইমেইল" beche nin.

- **Phone mode (default):** enter a Bangladeshi number like `01712345678`. The form normalises it to E.164 (`+8801712345678`) before sending it to Supabase. Email is optional — apnar customer email lagle add korte paren, na chaile khali rakhun.
- **Email mode:** classic email + password. Phone is still collected as a delivery contact.

**One-time Supabase setup for phone signups:**

1. Supabase Dashboard → **Authentication → Sign In / Providers**
2. Find **"Phone"** in the provider list and turn it **ON**
3. Scroll to the **"Confirm phone"** toggle and turn it **OFF** (otherwise Supabase will try to send an SMS OTP via a paid provider like Twilio).
4. Save.

Now customers can sign up with phone+password instantly, no SMS required.

> Want OTP confirmation instead? Wire up Twilio / MessageBird as the SMS provider in Supabase. The signup form already shows the right "OTP পাঠানো হয়েছে" screen when `data.session` is null, so the customer just needs to verify and then visit `/login`.

### 🚚 Make delivery free / change the fee — without code changes

Three knobs on Railway (Vercel works the same way) drive the delivery cost. Open **Railway → your service → Variables** and add/update any of these. The site auto-redeploys in ~30 seconds.

| Variable | What it does | Default |
|---|---|---|
| `NEXT_PUBLIC_DELIVERY_FEE` | Flat fee in BDT charged below the threshold. **Set to `0` to make delivery always free.** | `120` |
| `NEXT_PUBLIC_FREE_DELIVERY_OVER` | Cart subtotal at or above which delivery becomes free. Set to `0` to never auto-waive. | `2000` |

**Common scenarios:**

- **Free delivery for everyone (promo / Eid):** set `NEXT_PUBLIC_DELIVERY_FEE=0` → save → wait 30s → done.
- **Lower the fee to ৳80:** set `NEXT_PUBLIC_DELIVERY_FEE=80`.
- **Free over ৳1000 instead of ৳2000:** set `NEXT_PUBLIC_FREE_DELIVERY_OVER=1000`.
- **Always charge the fee, never auto-waive:** set `NEXT_PUBLIC_FREE_DELIVERY_OVER=0`.
- **Roll back to defaults:** delete the variables (or just unset them) and redeploy.

The cart's "buy ৳X more for free delivery" hint hides itself automatically when delivery is already free.

### 💳 Turn payment methods on/off (e.g. disable COD when on holiday)

Add `NEXT_PUBLIC_PAYMENT_METHODS` on Railway, comma-separated:

```env
# All four (default behaviour if unset)
NEXT_PUBLIC_PAYMENT_METHODS=cod,bkash,nagad,rocket

# COD off — accept only mobile financial services
NEXT_PUBLIC_PAYMENT_METHODS=bkash,nagad,rocket

# Only bKash
NEXT_PUBLIC_PAYMENT_METHODS=bkash

# Re-enable COD any time by adding it back to the list
NEXT_PUBLIC_PAYMENT_METHODS=cod,bkash
```

Whichever methods you list are the only tiles rendered on `/checkout`. The form's default selection is the first method in your list. Save → 30s redeploy → live. Existing orders aren't touched.

> 📝 The order schema in Supabase still allows all four method values, so you can re-enable COD later without any migration.

### 📦 Minimum order quantity

Set a cart-wide minimum kilogram threshold so single-piece orders are blocked.

| Variable | What it does | Default |
|---|---|---|
| `NEXT_PUBLIC_MIN_ORDER_KG` | Minimum **total** kilograms across all cart items required to checkout. Set to `0` to remove the limit. | `10` |

Behaviour:
- The product detail page's quantity selector starts at the minimum (so a one-product order already satisfies the rule).
- The cart shows an amber "ন্যূনতম অর্ডার N কেজি — কার্টে আরও X কেজি যোগ করুন" warning and disables the checkout button until met.
- The checkout form re-validates on submit and bounces the customer back to /cart if they somehow bypass the UI.

### ✨ Animated promo banners

The site now has two production-grade promo zones — both Bangla, both built with motion that's smooth on phones and respects `prefers-reduced-motion`.

| Where | Component | Animation |
|---|---|---|
| Above the navbar on every public page | `components/promo/TopMarquee.tsx` | Pure-CSS infinite right-to-left scroll with a duplicated track for seamless loop. Pauses on hover/long-press. |
| On the home page between the 3D hero and the featured grid | `components/promo/RotatingHighlights.tsx` | `framer-motion` `<AnimatePresence>` slide-up + fade transition every 3.8s, with click-to-jump indicator dots. |

Tweak the messages by editing the `PROMO_MESSAGES` / `HIGHLIGHTS` arrays at the top of each component.

### 👨‍💻 Developer credit

Footer carries a clickable credit:

> Developed by [MD FOISAL IQBAL](https://www.facebook.com/foysal.iqbal.359)
