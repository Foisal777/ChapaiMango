/**
 * Bangla ⇄ English i18n.
 *
 * One shared, client-safe dictionary (this file) + a cookie
 * (`cm-locale`) that both server components (`lib/i18n-server.ts`)
 * and the client `LocaleProvider` read. Switching language sets the
 * cookie and refreshes the route, so server-rendered text switches
 * too — not just client islands. Default: Bangla.
 *
 * Operator content (product names/descriptions, hero text saved in
 * admin settings, refund policy…) is NOT translated here — it shows
 * exactly as the admin entered it.
 */

export type Locale = "bn" | "en";
export const LOCALE_COOKIE = "cm-locale";
export const DEFAULT_LOCALE: Locale = "bn";

export function isLocale(v: unknown): v is Locale {
  return v === "bn" || v === "en";
}

/** Convert ASCII digits to Bangla digits in BN mode (e.g. 64 → ৬৪). */
export function num(value: number | string, locale: Locale): string {
  const s = String(value);
  if (locale !== "bn") return s;
  return s.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
}

const bn = {
  nav: {
    home: "হোম", shop: "শপ", about: "আমাদের সম্পর্কে", team: "আমাদের টিম",
    contact: "যোগাযোগ", cart: "কার্ট", menu: "মেনু", signIn: "সাইন ইন",
    signUp: "সাইন আপ", myOrders: "আমার অর্ডার", adminPanel: "অ্যাডমিন প্যানেল",
    signOut: "সাইন আউট", track: "অর্ডার ট্র্যাক", language: "ভাষা"
  },
  common: {
    orderNow: "এখনই অর্ডার করুন", viewAll: "সব দেখুন", perKg: "প্রতি কেজি",
    kg: "কেজি", free: "ফ্রি", total: "মোট", subtotal: "সাবটোটাল",
    delivery: "ডেলিভারি", backToShop: "শপে ফিরে যান"
  },
  hero: {
    badge: "GI-ট্যাগ পাওয়া ক্ষীরসাপাত পাওয়া যাচ্ছে",
    titleFirst: "চাঁপাইনবাবগঞ্জের",
    titleRest: "বাগান থেকে সরাসরি আপনার দরজায়",
    subtitle: "গাছপাকা, কেমিক্যাল-মুক্ত, হাতে বাছাই করা আম — হিমসাগর, ল্যাংড়া, ক্ষীরসাপাত, ফজলি, আম্রপালি, গোপালভোগ। ঐতিহ্যবাহী জাত থেকে হাইব্রিড, সবকিছু এক জায়গায়।",
    orderNow: "এখনই অর্ডার করুন", ourStory: "আমাদের গল্প",
    varieties: "আমের জাত", chemicalFree: "কেমিক্যাল-মুক্ত",
    districts: "জেলায় ডেলিভারি", treeRipe: "১০০% গাছপাকা · কেমিক্যাল-মুক্ত"
  },
  home: {
    featuredKicker: "━ বিশেষ জাতসমূহ",
    featuredTitleA: "চাঁপাইনবাবগঞ্জের", featuredTitleB: "সেরা আম",
    whyKicker: "━ কেন Chapai Mango House?",
    whyTitleA: "শুধু আম নয়,", whyTitleB: "বিশ্বাস", whyTitleC: "ডেলিভার করি",
    whyItems: [
      { title: "১০০% কেমিক্যাল-মুক্ত", desc: "কার্বাইড নেই, ফরমালিন নেই। শুধুই গাছপাকা খাঁটি আম।" },
      { title: "সরাসরি বাগান থেকে", desc: "চাঁপাইনবাবগঞ্জের নিজস্ব বাগান থেকে সরাসরি আপনার বাসায়।" },
      { title: "নিরাপদ প্যাকেজিং", desc: "বিশেষ ফোম-প্যাডিং কার্টন — একটিও আম নষ্ট হবে না।" },
      { title: "দ্রুত ডেলিভারি", desc: "২৪–৭২ ঘণ্টায় বাংলাদেশের ৬৪টি জেলায় হোম ডেলিভারি।" },
      { title: "মান নিশ্চয়তা", desc: "নষ্ট আম পেলে ১০০% রিপ্লেসমেন্ট অথবা সম্পূর্ণ রিফান্ড।" },
      { title: "ঐতিহ্যবাহী জাত", desc: "GI-ট্যাগ পাওয়া ক্ষীরসাপাত, খাঁটি হিমসাগর, ল্যাংড়া।" }
    ],
    highlights: [
      { title: "সারাদেশে ডেলিভারি", sub: "৬৪ জেলায় ২৪–৭২ ঘণ্টায় হোম ডেলিভারি" },
      { title: "চাঁপাইনবাবগঞ্জের প্রিমিয়াম আম", sub: "GI ট্যাগ পাওয়া ক্ষীরসাপাত · ঐতিহ্যবাহী হিমসাগর" },
      { title: "১০০% গাছপাকা, কেমিক্যাল-মুক্ত", sub: "তিন প্রজন্মের ঐতিহ্য, খাঁটি বাংলা আম" },
      { title: "সরাসরি বাগান থেকে আপনার দরজায়", sub: "নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ" }
    ],
    testimonialsKicker: "━ গ্রাহকের মতামত",
    testimonialsTitleA: "মানুষ কী", testimonialsTitleB: "বলছে",
    ctaTitle: "আমের মৌসুম মিস করবেন না!",
    ctaDesc: "সীমিত স্টক — চাঁপাইনবাবগঞ্জের গাছপাকা ঐতিহ্যবাহী আম, মে থেকে আগস্ট।",
    socialKicker: "━ আমাদের সাথে থাকুন",
    socialTitleA: "মৌসুমের প্রতিটা", socialTitleB: "আপডেট", socialTitleC: "পান",
    socialDesc: "নতুন আম এলে, কোন জাত পাওয়া যাচ্ছে, ডেলিভারি কেমন চলছে — সব ভিডিও আর ছবিতে দেখুন আমাদের সোশ্যাল চ্যানেলে।",
    followFacebook: "Facebook ফলো করুন", followTikTok: "TikTok ফলো করুন"
  },
  footer: {
    tagline: "চাঁপাইনবাবগঞ্জের গাছপাকা, কেমিক্যাল-মুক্ত আম — সরাসরি আপনার দরজায়। ঐতিহ্যবাহী জাত থেকে হাইব্রিড, সবকিছু এখানে এক জায়গায়।",
    followUs: "আমাদের ফলো করুন", explore: "অন্বেষণ", contact: "যোগাযোগ",
    track: "অর্ডার ট্র্যাক", privacy: "প্রাইভেসি পলিসি", refund: "রিফান্ড পলিসি",
    madeIn: "বাংলাদেশে তৈরি", weAccept: "We Accept · আমরা গ্রহণ করি",
    secureNote: "নিরাপদ পেমেন্ট · পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা"
  },
  shop: {
    kicker: "━ শপ", titleA: "আমাদের", titleB: "আম কালেকশন",
    subtitle: "ঐতিহ্যবাহী জাত থেকে হাইব্রিড — সব আম এক জায়গায়।",
    searchPlaceholder: "আম খুঁজুন (Himsagar, Langra...)",
    allVarieties: "সব জাত", sortFeatured: "বিশেষ আগে",
    sortPriceAsc: "দাম: কম → বেশি", sortPriceDesc: "দাম: বেশি → কম",
    sortRating: "টপ রেটেড",
    found: (n: number, l: Locale) => `${num(n, l)}টি পণ্য পাওয়া গেছে`,
    empty: "কিছু পাওয়া যায়নি। অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন।",
    featured: "বিশেষ", view: "দেখুন"
  },
  product: {
    stock: (n: number, l: Locale) => `স্টক: ${num(n, l)} কেজি`,
    reviewsCount: (n: number, l: Locale) => `(${num(n, l)}টি রিভিউ)`,
    origin: "উৎপত্তি", season: "মৌসুম", quality: "মান", chemicalFree: "কেমিক্যাল-মুক্ত",
    deliveryNoteTitle: "ডেলিভারি:",
    deliveryNote: "ঢাকার ভেতরে ২৪ ঘণ্টা · বাংলাদেশের সব জেলায় ৪৮–৭২ ঘণ্টা · অর্ডার কনফার্মেশনের পর SMS / কল পাবেন।",
    qty: "পরিমাণ (কেজি)", decrease: "কমান", increase: "বাড়ান",
    minOrder: (n: number, l: Locale) => `ন্যূনতম অর্ডার (কার্টে মোট) ${num(n, l)} কেজি।`,
    addToCart: "কার্টে যোগ করুন", buyNow: "এখনই কিনুন",
    addedToast: (qty: number, name: string, l: Locale) => `${num(qty, l)} কেজি ${name} কার্টে যোগ হয়েছে`
  },
  cart: {
    kicker: "━ কার্ট", titleA: "আপনার", titleB: "কার্ট",
    emptyTitle: "কার্ট ফাঁকা", emptyDesc: "আপনার পছন্দের আম বেছে কার্টে যোগ করুন।",
    browse: "শপ দেখুন", summary: "অর্ডার সারমর্ম", remove: "সরান",
    freeDeliveryHint: (amount: string) => `${amount} আরও কিনলেই → ফ্রি ডেলিভারি!`,
    minOrderWarn: (min: number, short: number, l: Locale) => `ন্যূনতম অর্ডার ${num(min, l)} কেজি — কার্টে আরও ${num(short, l)} কেজি যোগ করুন।`,
    checkout: "চেকআউট",
    checkoutKg: (a: number, b: number, l: Locale) => `চেকআউট (${num(a, l)}/${num(b, l)} কেজি)`,
    continueShopping: "← আরও কিনতে যান"
  },
  checkout: {
    kicker: "━ চেকআউট", titleA: "অর্ডার", titleB: "কনফার্ম করুন",
    contactInfo: "যোগাযোগের তথ্য", name: "নাম *", phone: "ফোন *",
    email: "ইমেইল (ঐচ্ছিক)", district: "জেলা *", selectDistrict: "জেলা নির্বাচন করুন",
    addressTitle: "ডেলিভারি ঠিকানা", address: "সম্পূর্ণ ঠিকানা *",
    addressPh: "বাড়ি, রোড, এরিয়া, থানা, পোস্ট কোড",
    notes: "বিশেষ নির্দেশনা (ঐচ্ছিক)", notesPh: "যেমন: গেটে আসার আগে ফোন দিন",
    paymentTitle: "পেমেন্ট পদ্ধতি", advance: "অগ্রিম",
    sendMoneyTo: "Send Money / Personal করুন এই নম্বরে:", transferTo: "এই অ্যাকাউন্টে ট্রান্সফার করুন:",
    restOnDelivery: (amount: string) => `বাকি ${amount} পণ্য পেয়ে দিন।`,
    txnId: "Transaction ID *", sender: "যে নম্বর/অ্যাকাউন্ট থেকে পাঠিয়েছেন *",
    summary: "অর্ডার সারমর্ম", payNow: "এখন পরিশোধ:", onDelivery: "ডেলিভারিতে:",
    confirm: (amount: string) => `অর্ডার কনফার্ম — ${amount}`,
    submitting: "পাঠাচ্ছি...", trackingNote: "অর্ডারের পর ছোট্ট CMH- ট্র্যাকিং আইডি পাবেন — সেটা দিয়ে যেকোনো সময় ডেলিভারির অবস্থা দেখা যাবে।",
    doneTitle: "অর্ডার কনফার্ম!",
    doneDesc: (method: string) => `ধন্যবাদ! আমরা আপনার ${method} অর্ডার পেয়েছি। আমাদের টিম শীঘ্রই ফোন করে কনফার্ম করবে।`,
    yourTrackingId: "আপনার ট্র্যাকিং আইডি",
    trackingKeep: "এই আইডিটা রেখে দিন — /track পেজে আইডি + ফোন নম্বর দিলেই অর্ডারের অবস্থা দেখা যাবে।",
    backHome: "হোমে ফিরুন", trackBtn: "ট্র্যাক করুন", buyMore: "আরও কিনুন",
    emptyCart: "কার্ট ফাঁকা — চেকআউট করার মতো কিছু নেই।", backToShopBtn: "শপে ফিরুন",
    noMethod: "এখন কোনো পেমেন্ট পদ্ধতি চালু নেই — অ্যাডমিনকে জানান।",
    numberNotSet: "নম্বর/অ্যাকাউন্ট সেট নেই — অ্যাডমিনকে জানান",
    errors: {
      name: "আপনার নাম লিখুন", phone: "সঠিক ফোন নম্বর দিন", email: "সঠিক ইমেইল দিন",
      district: "জেলা নির্বাচন করুন", address: "সম্পূর্ণ ঠিকানা লিখুন",
      methodOff: "এই পেমেন্ট পদ্ধতি বর্তমানে চালু নেই", txn: "Transaction ID দিন",
      sender: "যে নম্বর/অ্যাকাউন্ট থেকে পাঠিয়েছেন সেটা দিন",
      form: "ফর্মে কিছু তথ্য বাকি/ভুল আছে — লাল লেখাগুলো দেখুন",
      cartEmpty: "কার্ট ফাঁকা — কিছু যোগ করুন",
      minOrder: (min: number, now: number, l: Locale) => `ন্যূনতম অর্ডার ${num(min, l)} কেজি — কার্টে এখন ${num(now, l)} কেজি`,
      signIn: "অর্ডার করতে সাইন ইন করুন", success: "অর্ডার কনফার্ম! ধন্যবাদ।",
      failed: (m: string) => `অর্ডার দেওয়া যায়নি: ${m}`, copied: (t: string) => `কপি হয়েছে: ${t}`
    }
  },
  track: {
    kicker: "━ ডেলিভারি ট্র্যাকিং", titleA: "অর্ডার", titleB: "ট্র্যাক", titleC: "করুন",
    intro: "অর্ডার কনফার্মেশনে পাওয়া CMH- ট্র্যাকিং আইডি এবং অর্ডার করার সময় যে ফোন নম্বর দিয়েছিলেন সেটা দিয়ে এখনই অবস্থা দেখুন। সাইন ইন না করেও কাজ করবে।",
    trackingId: "ট্র্যাকিং আইডি *", phone: "ফোন নম্বর *",
    hint: "অর্ডার কনফার্মেশনে পাওয়া ছোট্ট CMH- ট্র্যাকিং আইডিটা দিন (পুরোনো অর্ডারের পুরো UUID-ও চলবে)।",
    search: "ট্র্যাক করুন", searching: "খুঁজছি...", current: "বর্তমান অবস্থা",
    cancelled: "অর্ডার বাতিল করা হয়েছে", cancelledNote: "বিস্তারিত জানতে কাস্টমার কেয়ার-এ যোগাযোগ করুন।",
    copied: "আইডি কপি হয়েছে",
    steps: ["অর্ডার গৃহীত", "কনফার্ম", "ডেলিভারিতে", "ডেলিভার্ড"] as string[]
  },
  auth: {
    welcomeBack: "আবার স্বাগতম", signInDesc: "আপনার অ্যাকাউন্টে সাইন ইন করুন",
    createAccount: "অ্যাকাউন্ট খুলুন", signUpDesc: "অর্ডার করতে একটি অ্যাকাউন্ট খুলুন",
    email: "ইমেইল", password: "পাসওয়ার্ড", name: "নাম",
    signInBtn: "সাইন ইন", signUpBtn: "সাইন আপ",
    noAccount: "অ্যাকাউন্ট নেই?", haveAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে?",
    or: "অথবা", continueGoogle: "Google দিয়ে চালিয়ে যান",
    myOrders: "আমার অর্ডার", ordersKicker: "━ আমার অর্ডার",
    ordersTitleA: "অর্ডার", ordersTitleB: "হিস্টরি",
    noOrders: "এখনো কোনো অর্ডার নেই", noOrdersDesc: "আপনার প্রথম অর্ডার দিতে শপ থেকে আম বেছে নিন।",
    payment: "পেমেন্ট:", phoneLabel: "ফোন:", itemsCount: (n: number, l: Locale) => `${num(n, l)}টি পণ্য`,
    signedInAs: (who: string) => `সাইন ইন: ${who}`,
    backHome: "হোমে ফিরুন", loginTitle: "স্বাগতম! সাইন ইন করুন",
    loginDesc: "অর্ডার করতে এবং অর্ডার হিস্টরি দেখতে সাইন ইন করুন।",
    signupTitle: "নতুন অ্যাকাউন্ট তৈরি করুন",
    signupDesc: "অর্ডার করতে এবং অর্ডার হিস্টরি দেখতে সাইন আপ করুন।",
    newUser: "নতুন ব্যবহারকারী?", existingUser: "আগে থেকেই অ্যাকাউন্ট আছে?",
    signUpNow: "সাইন আপ করুন", signInNow: "সাইন ইন করুন",
    notConfigured: "Supabase কনফিগার করা হয়নি",
    phone: "ফোন", phoneNumber: "ফোন নম্বর", howSignIn: "কী দিয়ে সাইন ইন করবেন?",
    signingIn: "সাইন ইন হচ্ছে...", welcome: "স্বাগতম!", fullName: "পূর্ণ নাম *",
    passwordMin: "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে", accountCreated: "অ্যাকাউন্ট তৈরি! স্বাগতম।",
    checkEmail: "আপনার ইমেইলে একটি কনফার্মেশন লিঙ্ক পাঠানো হয়েছে।",
    genericError: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।", googleSignup: "Google দিয়ে সাইন আপ"
  },
  contact: {
    kicker: "━ যোগাযোগ", titleA: "আমাদের", titleB: "যোগাযোগ করুন",
    subtitle: "প্রশ্ন, মতামত বা বাল্ক অর্ডারের জন্য মেসেজ পাঠান — দ্রুত উত্তর দেব।",
    name: "নাম *", email: "ইমেইল", phone: "ফোন", message: "মেসেজ *",
    send: "মেসেজ পাঠান", sending: "পাঠাচ্ছি...",
    sent: "মেসেজ পাঠানো হয়েছে! শীঘ্রই যোগাযোগ করব।",
    phoneCard: "ফোন / WhatsApp", emailCard: "ইমেইল", addressCard: "বাগান / অফিস",
    writeMessage: "মেসেজ লিখুন", replyNote: "ফর্ম পূরণ করলে আমরা ২৪ ঘণ্টার মধ্যে যোগাযোগ করব।",
    subtitleLong: "অর্ডার, ডেলিভারি বা যে কোনো প্রশ্ন — আমরা সবসময় পাশে আছি। ফোন, ইমেইল অথবা ফর্ম পূরণ করুন।",
    support: "কাস্টমার সাপোর্ট", supportHours: "সকাল ৯টা — রাত ৯টা (প্রতিদিন)",
    viewMaps: "Google Maps-এ দেখুন", namePh: "আপনার নাম", messagePh: "আপনার মেসেজ এখানে লিখুন...",
    failed: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন বা ফোন করুন。"
  },
  about: {
    kicker: "━ আমাদের গল্প",
    titleA: "তিন", titleB: "প্রজন্মের", titleC: "বাগান, একটিই প্রতিশ্রুতি —", titleD: "খাঁটি আম।",
    intro: "চাঁপাইনবাবগঞ্জ — বাংলাদেশের আমের রাজধানী। আমাদের পরিবার ১৯৮৫ সাল থেকে নিজামপুর, নাচোলে আম চাষ করে আসছে। আজ আমরা সেই ঐতিহ্যকে অনলাইনে নিয়ে এসেছি, যাতে আপনিও পেতে পারেন গাছপাকা, কেমিক্যাল-মুক্ত চাঁপাইনবাবগঞ্জের আম।",
    orchard: "বাগান",
    stats: [
      { value: "৫০০+", label: "আম গাছ" }, { value: "০%", label: "কেমিক্যাল ব্যবহার" },
      { value: "১২হাজার+", label: "সন্তুষ্ট গ্রাহক" }, { value: "GI", label: "ট্যাগ সার্টিফায়েড" }
    ],
    timeline: [
      { year: "১৯৮৫", title: "পারিবারিক বাগানের সূচনা", desc: "আমাদের দাদা চাঁপাইনবাবগঞ্জে প্রথম ৫০টি আম গাছ রোপণ করেন।" },
      { year: "২০১০", title: "জৈব চাষে পূর্ণ যাত্রা", desc: "কেমিক্যাল-মুক্ত চাষে বিশেষ ফোকাস — কীটনাশক বন্ধ।" },
      { year: "২০১৮", title: "ক্ষীরসাপাতের GI ট্যাগ", desc: "চাঁপাই ক্ষীরসাপাত Geographical Indication-এ নিবন্ধিত হয়।" },
      { year: "২০২৪", title: "অনলাইন যাত্রা শুরু", desc: "Chapai Mango House — সারা বাংলাদেশে হোম ডেলিভারি শুরু।" }
    ]
  },
  team: {
    kicker: "━ আমাদের টিম", titleA: "যাদের হাতে", titleB: "গড়ে ওঠে", titleC: "খাঁটি আম",
    subtitle: "প্রতিষ্ঠাতা থেকে শুরু করে বাগানের চাষি, প্যাকেজিং দল আর ডেলিভারি টিম — প্রত্যেকের পরিশ্রমেই আপনার দরজায় পৌঁছায় চাঁপাইনবাবগঞ্জের সেরা আম।",
    empty: "টিম তথ্য এখনো যোগ করা হয়নি",
    roles: {
      founder: { heading: "প্রতিষ্ঠাতা", subheading: "যাঁদের স্বপ্নে গড়ে উঠেছে Chapai Mango House" },
      supplier: { heading: "আমাদের সরবরাহকারী", subheading: "চাঁপাইনবাবগঞ্জের অভিজ্ঞ চাষি ও বাগান অংশীদার — খাঁটি আমের প্রকৃত উৎস" },
      member: { heading: "টিম সদস্য", subheading: "প্যাকেজিং, ডেলিভারি ও কাস্টমার কেয়ার দলের পরিচিত মুখগুলো" }
    }
  },
  aboutExtra: {
    journey: "আমাদের যাত্রা", journeyTitleA: "আমাদের", journeyTitleB: "পথচলা", soon: "শীঘ্রই আমাদের পরিবার সম্পর্কে জানতে পারবেন।", joinFamily: "আমাদের পরিবারের অংশ হয়ে চাখুন চাঁপাইয়ের সেরা আম।", browseShopTeam: "শপ দেখুন",
    promise: "আমাদের প্রতিশ্রুতি — আপনার পরিবারের জন্য খাঁটি চাঁপাইয়ের আম, প্রথম দিন থেকে শেষ দিন পর্যন্ত।",
    browseShop: "শপ দেখুন"
  },
  reviews: {
    title: "গ্রাহক রিভিউ", write: "রিভিউ লিখুন", rating: "রেটিং",
    yourName: "আপনার নাম", titlePh: "শিরোনাম (ঐচ্ছিক)", bodyPh: "আম কেমন লেগেছে লিখুন…",
    submit: "রিভিউ জমা দিন", signInToReview: "রিভিউ দিতে সাইন ইন করুন",
    noReviews: "এখনো কোনো রিভিউ নেই — প্রথম রিভিউটা আপনার হোক!",
    pendingNote: "রিভিউটি অনুমোদনের পর দেখা যাবে।", thanks: "ধন্যবাদ! রিভিউ জমা হয়েছে।",
    kicker: "━ রিভিউ", titleA: "ক্রেতাদের", titleB: "মতামত",
    signInNote: "আপনার অভিজ্ঞতা অন্যদের সাহায্য করবে। ফোন/ইমেইল বা Google দিয়ে সাইন ইন করুন।",
    alreadyTitle: "ধন্যবাদ!", already: "আপনি ইতিমধ্যে এই আমের জন্য রিভিউ দিয়েছেন।",
    first: "প্রথম রিভিউটা আপনিই দিন!", ratingNone: "এখনো রেটিং নেই",
    count: (n: number, l: Locale) => `${num(n, l)}টি রিভিউ`
  },
  misc: {
    loading: "লোড হচ্ছে…", notFound: "পাওয়া যায়নি", home: "হোম",
    notFoundTitle: "আমটি খুঁজে পাইনি", notFoundMsg: "এই পণ্যটি এখনো নেই অথবা লিঙ্কে কিছু ভুল আছে।"
  }
};

export type Dictionary = typeof bn;

const en: Dictionary = {
  nav: {
    home: "Home", shop: "Shop", about: "About Us", team: "Our Team",
    contact: "Contact", cart: "Cart", menu: "Menu", signIn: "Sign In",
    signUp: "Sign Up", myOrders: "My Orders", adminPanel: "Admin Panel",
    signOut: "Sign Out", track: "Track Order", language: "Language"
  },
  common: {
    orderNow: "Order Now", viewAll: "View All", perKg: "per kg",
    kg: "kg", free: "Free", total: "Total", subtotal: "Subtotal",
    delivery: "Delivery", backToShop: "Back to Shop"
  },
  hero: {
    badge: "GI-tagged Khirsapat now available",
    titleFirst: "From Chapainawabganj's",
    titleRest: "orchards, straight to your door",
    subtitle: "Tree-ripened, chemical-free, hand-picked mangoes — Himsagar, Langra, Khirsapat, Fazli, Amrapali, Gopalbhog. From heritage varieties to hybrids, everything in one place.",
    orderNow: "Order Now", ourStory: "Our Story",
    varieties: "Mango varieties", chemicalFree: "Chemical-free",
    districts: "Districts served", treeRipe: "100% tree-ripened · Chemical-free"
  },
  home: {
    featuredKicker: "━ Featured Varieties",
    featuredTitleA: "Chapainawabganj's", featuredTitleB: "Finest Mangoes",
    whyKicker: "━ Why Chapai Mango House?",
    whyTitleA: "We deliver more than mangoes —", whyTitleB: "trust", whyTitleC: "",
    whyItems: [
      { title: "100% Chemical-Free", desc: "No carbide, no formalin. Just pure tree-ripened mangoes." },
      { title: "Straight From Our Orchard", desc: "Directly from our own orchards in Chapainawabganj to your home." },
      { title: "Safe Packaging", desc: "Special foam-padded cartons — not a single mango gets damaged." },
      { title: "Fast Delivery", desc: "Home delivery within 24–72 hours across all 64 districts of Bangladesh." },
      { title: "Quality Guarantee", desc: "Damaged mango? 100% replacement or a full refund." },
      { title: "Heritage Varieties", desc: "GI-tagged Khirsapat, authentic Himsagar and Langra." }
    ],
    highlights: [
      { title: "Nationwide Delivery", sub: "Home delivery in 24–72 hours across 64 districts" },
      { title: "Premium Chapainawabganj Mangoes", sub: "GI-tagged Khirsapat · Heritage Himsagar" },
      { title: "100% Tree-Ripened, Chemical-Free", sub: "Three generations of tradition, authentic Bengali mangoes" },
      { title: "From Our Orchard to Your Door", sub: "Nizampur, Nachole, Chapainawabganj" }
    ],
    testimonialsKicker: "━ Customer Reviews",
    testimonialsTitleA: "What people", testimonialsTitleB: "are saying",
    ctaTitle: "Don't miss mango season!",
    ctaDesc: "Limited stock — tree-ripened heritage mangoes from Chapainawabganj, May to August.",
    socialKicker: "━ Stay With Us",
    socialTitleA: "Get every", socialTitleB: "season", socialTitleC: "update",
    socialDesc: "New arrivals, which varieties are in stock, delivery updates — watch it all in videos and photos on our social channels.",
    followFacebook: "Follow on Facebook", followTikTok: "Follow on TikTok"
  },
  footer: {
    tagline: "Tree-ripened, chemical-free mangoes from Chapainawabganj — straight to your door. From heritage varieties to hybrids, everything in one place.",
    followUs: "Follow Us", explore: "Explore", contact: "Contact",
    track: "Track Order", privacy: "Privacy Policy", refund: "Refund Policy",
    madeIn: "Made in Bangladesh", weAccept: "We Accept",
    secureNote: "Secure payments · Cash on delivery available"
  },
  shop: {
    kicker: "━ Shop", titleA: "Our", titleB: "Mango Collection",
    subtitle: "From heritage varieties to hybrids — all mangoes in one place.",
    searchPlaceholder: "Search mangoes (Himsagar, Langra...)",
    allVarieties: "All varieties", sortFeatured: "Featured first",
    sortPriceAsc: "Price: low → high", sortPriceDesc: "Price: high → low",
    sortRating: "Top rated",
    found: (n: number) => `${n} product${n === 1 ? "" : "s"} found`,
    empty: "Nothing found. Try another keyword.",
    featured: "Featured", view: "View"
  },
  product: {
    stock: (n: number) => `Stock: ${n} kg`,
    reviewsCount: (n: number) => `(${n} review${n === 1 ? "" : "s"})`,
    origin: "Origin", season: "Season", quality: "Quality", chemicalFree: "Chemical-free",
    deliveryNoteTitle: "Delivery:",
    deliveryNote: "Within Dhaka in 24 hours · All districts in 48–72 hours · You'll get an SMS/call after order confirmation.",
    qty: "Quantity (kg)", decrease: "Decrease", increase: "Increase",
    minOrder: (n: number) => `Minimum order (cart total) ${n} kg.`,
    addToCart: "Add to Cart", buyNow: "Buy Now",
    addedToast: (qty: number, name: string) => `${qty} kg of ${name} added to cart`
  },
  cart: {
    kicker: "━ Cart", titleA: "Your", titleB: "Cart",
    emptyTitle: "Your cart is empty", emptyDesc: "Pick your favourite mangoes and add them to the cart.",
    browse: "Browse Shop", summary: "Order Summary", remove: "Remove",
    freeDeliveryHint: (amount: string) => `Buy ${amount} more for FREE delivery!`,
    minOrderWarn: (min: number, short: number) => `Minimum order is ${min} kg — add ${short} kg more to your cart.`,
    checkout: "Checkout",
    checkoutKg: (a: number, b: number) => `Checkout (${a}/${b} kg)`,
    continueShopping: "← Continue shopping"
  },
  checkout: {
    kicker: "━ Checkout", titleA: "Confirm your", titleB: "order",
    contactInfo: "Contact Information", name: "Name *", phone: "Phone *",
    email: "Email (optional)", district: "District *", selectDistrict: "Select district",
    addressTitle: "Delivery Address", address: "Full address *",
    addressPh: "House, road, area, thana, postcode",
    notes: "Special instructions (optional)", notesPh: "e.g. Please call before arriving at the gate",
    paymentTitle: "Payment Method", advance: "Advance",
    sendMoneyTo: "Send Money / Personal to this number:", transferTo: "Transfer to this account:",
    restOnDelivery: (amount: string) => `Pay the remaining ${amount} when you receive your order.`,
    txnId: "Transaction ID *", sender: "Number/account you sent from *",
    summary: "Order Summary", payNow: "Pay now:", onDelivery: "On delivery:",
    confirm: (amount: string) => `Confirm Order — ${amount}`,
    submitting: "Placing order...", trackingNote: "After ordering you'll get a short CMH- tracking ID — use it anytime to check your delivery status.",
    doneTitle: "Order Confirmed!",
    doneDesc: (method: string) => `Thank you! We've received your ${method} order. Our team will call you shortly to confirm.`,
    yourTrackingId: "Your Tracking ID",
    trackingKeep: "Keep this ID safe — enter it with your phone number on the /track page to see your order status.",
    backHome: "Back to Home", trackBtn: "Track Order", buyMore: "Shop More",
    emptyCart: "Your cart is empty — nothing to check out.", backToShopBtn: "Back to Shop",
    noMethod: "No payment method is enabled right now — please contact the admin.",
    numberNotSet: "Number/account not set — please contact the admin",
    errors: {
      name: "Please enter your name", phone: "Please enter a valid phone number", email: "Please enter a valid email",
      district: "Please select a district", address: "Please enter your full address",
      methodOff: "This payment method is currently unavailable", txn: "Please enter the Transaction ID",
      sender: "Please enter the number/account you sent from",
      form: "Some information is missing or incorrect — check the red messages",
      cartEmpty: "Your cart is empty — add something first",
      minOrder: (min: number, now: number) => `Minimum order is ${min} kg — your cart has ${now} kg`,
      signIn: "Please sign in to place an order", success: "Order confirmed! Thank you.",
      failed: (m: string) => `Couldn't place the order: ${m}`, copied: (t: string) => `Copied: ${t}`
    }
  },
  track: {
    kicker: "━ Delivery Tracking", titleA: "Track your", titleB: "order", titleC: "",
    intro: "Enter the CMH- tracking ID from your order confirmation and the phone number you ordered with to see your status instantly. No sign-in needed.",
    trackingId: "Tracking ID *", phone: "Phone number *",
    hint: "Enter the short CMH- tracking ID from your confirmation (the old full UUID also works).",
    search: "Track Order", searching: "Searching...", current: "Current status",
    cancelled: "This order was cancelled", cancelledNote: "Please contact customer care for details.",
    copied: "ID copied",
    steps: ["Order received", "Confirmed", "Out for delivery", "Delivered"]
  },
  auth: {
    welcomeBack: "Welcome back", signInDesc: "Sign in to your account",
    createAccount: "Create an account", signUpDesc: "Create an account to place orders",
    email: "Email", password: "Password", name: "Name",
    signInBtn: "Sign In", signUpBtn: "Sign Up",
    noAccount: "Don't have an account?", haveAccount: "Already have an account?",
    or: "or", continueGoogle: "Continue with Google",
    myOrders: "My Orders", ordersKicker: "━ My Orders",
    ordersTitleA: "Order", ordersTitleB: "History",
    noOrders: "No orders yet", noOrdersDesc: "Pick some mangoes from the shop to place your first order.",
    payment: "Payment:", phoneLabel: "Phone:", itemsCount: (n: number) => `${n} item${n === 1 ? "" : "s"}`,
    signedInAs: (who: string) => `Signed in: ${who}`,
    backHome: "Back to Home", loginTitle: "Welcome! Sign in",
    loginDesc: "Sign in to place orders and view your order history.",
    signupTitle: "Create a new account",
    signupDesc: "Sign up to place orders and view your order history.",
    newUser: "New user?", existingUser: "Already have an account?",
    signUpNow: "Sign up", signInNow: "Sign in",
    notConfigured: "Supabase is not configured",
    phone: "Phone", phoneNumber: "Phone number", howSignIn: "How would you like to sign in?",
    signingIn: "Signing in...", welcome: "Welcome!", fullName: "Full name *",
    passwordMin: "Password must be at least 6 characters", accountCreated: "Account created! Welcome.",
    checkEmail: "A confirmation link has been sent to your email.",
    genericError: "Something went wrong. Please try again.", googleSignup: "Sign up with Google"
  },
  contact: {
    kicker: "━ Contact", titleA: "Get in", titleB: "touch",
    subtitle: "Send us a message for questions, feedback or bulk orders — we reply fast.",
    name: "Name *", email: "Email", phone: "Phone", message: "Message *",
    send: "Send Message", sending: "Sending...",
    sent: "Message sent! We'll get back to you soon.",
    phoneCard: "Phone / WhatsApp", emailCard: "Email", addressCard: "Orchard / Office",
    writeMessage: "Write a message", replyNote: "Fill in the form and we'll get back to you within 24 hours.",
    subtitleLong: "Orders, delivery or any question — we're always here. Call, email or fill in the form.",
    support: "Customer Support", supportHours: "9 AM — 9 PM (every day)",
    viewMaps: "View on Google Maps", namePh: "Your name", messagePh: "Write your message here...",
    failed: "Something went wrong. Please try again or call us."
  },
  about: {
    kicker: "━ Our Story",
    titleA: "Three", titleB: "generations", titleC: "of orchard, one promise —", titleD: "pure mangoes.",
    intro: "Chapainawabganj — the mango capital of Bangladesh. Our family has grown mangoes in Nizampur, Nachole since 1985. Today we've brought that heritage online, so you can enjoy tree-ripened, chemical-free Chapainawabganj mangoes too.",
    orchard: "Orchard",
    stats: [
      { value: "500+", label: "Mango trees" }, { value: "0%", label: "Chemical use" },
      { value: "12k+", label: "Happy customers" }, { value: "GI", label: "Tag certified" }
    ],
    timeline: [
      { year: "1985", title: "Our family orchard begins", desc: "Our grandfather planted the first 50 mango trees in Chapainawabganj." },
      { year: "2010", title: "Fully organic farming", desc: "A full focus on chemical-free farming — pesticides stopped." },
      { year: "2018", title: "Khirsapat gets its GI tag", desc: "Chapai Khirsapat was registered as a Geographical Indication product." },
      { year: "2024", title: "The online journey begins", desc: "Chapai Mango House — home delivery across Bangladesh begins." }
    ]
  },
  team: {
    kicker: "━ Our Team", titleA: "The hands that craft", titleB: "pure", titleC: "mangoes",
    subtitle: "From our founders to orchard farmers, the packing team and delivery crew — everyone's hard work brings Chapainawabganj's finest mangoes to your door.",
    empty: "Team information hasn't been added yet",
    roles: {
      founder: { heading: "Founders", subheading: "The people whose dream built Chapai Mango House" },
      supplier: { heading: "Our Suppliers", subheading: "Experienced Chapainawabganj farmers and orchard partners — the true source of pure mangoes" },
      member: { heading: "Team Members", subheading: "The familiar faces of our packaging, delivery and customer-care teams" }
    }
  },
  aboutExtra: {
    journey: "Our Journey", journeyTitleA: "Our", journeyTitleB: "journey", soon: "You will soon be able to meet our family.", joinFamily: "Become part of our family and taste Chapai's finest mangoes.", browseShopTeam: "Browse Shop",
    promise: "Our promise — pure Chapai mangoes for your family, from the first day to the last.",
    browseShop: "Browse Shop"
  },
  reviews: {
    title: "Customer Reviews", write: "Write a review", rating: "Rating",
    yourName: "Your name", titlePh: "Title (optional)", bodyPh: "Tell us how the mangoes were…",
    submit: "Submit Review", signInToReview: "Sign in to write a review",
    noReviews: "No reviews yet — be the first!",
    pendingNote: "Your review will appear after approval.", thanks: "Thank you! Your review was submitted.",
    kicker: "━ Reviews", titleA: "Customer", titleB: "reviews",
    signInNote: "Your experience will help others. Sign in with phone/email or Google.",
    alreadyTitle: "Thank you!", already: "You have already reviewed this mango.",
    first: "Be the first to review!", ratingNone: "No ratings yet",
    count: (n: number) => `${n} review${n === 1 ? "" : "s"}`
  },
  misc: { loading: "Loading…", notFound: "Not found", home: "Home", notFoundTitle: "Mango not found", notFoundMsg: "This product does not exist yet, or the link is wrong." }
};

export const dictionaries: Record<Locale, Dictionary> = { bn, en };
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? bn;
}
