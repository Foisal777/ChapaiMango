import Link from "next/link";
import {
  Shield,
  Database,
  Cookie,
  Lock,
  UserCheck,
  Baby,
  RefreshCw,
  Mail,
  ScrollText
} from "lucide-react";

export const metadata = {
  title: "প্রাইভেসি পলিসি — Chapai Mango House",
  description:
    "Chapai Mango House আপনার ব্যক্তিগত তথ্য কীভাবে সংগ্রহ, ব্যবহার এবং সুরক্ষা করে — তার সম্পূর্ণ বিবরণ।"
};

// Privacy policy is text-only and rarely changes — let Next.js
// fully cache the rendered HTML at the edge.
export const revalidate = 86400; // 24h

const LAST_UPDATED = "২৩ মে, ২০২৬";

export default function PrivacyPolicyPage() {
  const businessEmail =
    process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "hello@chapaimangohouse.com";
  const businessPhone =
    process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+880 1XXX-XXXXXX";

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-radial">
        <div className="container-x py-16 text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-mango-600 mb-2">
            ━ আইনি ডকুমেন্ট
          </p>
          <h1 className="font-display-bn text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            <span className="shimmer-text">প্রাইভেসি</span> পলিসি
          </h1>
          <p className="mt-5 text-ink/70 text-base sm:text-lg">
            আপনার ব্যক্তিগত তথ্যের নিরাপত্তা আমাদের কাছে সবচেয়ে গুরুত্বপূর্ণ।
            এই পলিসি ব্যাখ্যা করে আমরা কী তথ্য সংগ্রহ করি, কেন করি এবং কীভাবে
            সুরক্ষিত রাখি।
          </p>
          <p className="mt-3 text-xs text-ink/50">
            সর্বশেষ হালনাগাদ: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="container-x py-14 max-w-4xl mx-auto space-y-8">
        <Block icon={<ScrollText className="h-5 w-5" />} title="১. ভূমিকা">
          <p>
            Chapai Mango House (&ldquo;আমরা&rdquo;, &ldquo;আমাদের&rdquo;) — একটি
            অনলাইন আম বিক্রয়কারী প্রতিষ্ঠান, যার অফিস নিজামপুর, নাচোল,
            চাঁপাইনবাবগঞ্জ, রাজশাহী, বাংলাদেশ-এ অবস্থিত। আমাদের ওয়েবসাইট
            ব্যবহার করার মাধ্যমে আপনি এই প্রাইভেসি পলিসি মেনে চলতে সম্মত হচ্ছেন।
            যদি কোনো শর্ত আপনার গ্রহণযোগ্য না হয়, অনুগ্রহ করে এই সেবাটি ব্যবহার
            করবেন না।
          </p>
        </Block>

        <Block
          icon={<Database className="h-5 w-5" />}
          title="২. আমরা কী তথ্য সংগ্রহ করি"
        >
          <p>আপনি যখন আমাদের সাইট ব্যবহার করেন, আমরা নিম্নলিখিত তথ্য সংগ্রহ করি:</p>
          <ul className="space-y-2 list-disc pl-5 mt-3">
            <li>
              <strong>অর্ডার-সংক্রান্ত তথ্য:</strong> পূর্ণ নাম, মোবাইল নম্বর,
              ইমেইল (ঐচ্ছিক), ডেলিভারি ঠিকানা, জেলা, এবং বিশেষ নির্দেশনা।
            </li>
            <li>
              <strong>অ্যাকাউন্ট তথ্য:</strong> সাইন-আপ করলে নাম, ইমেইল এবং
              একটি এনক্রিপ্টেড পাসওয়ার্ড। Google দিয়ে সাইন ইন করলে শুধু নাম
              ও ইমেইল।
            </li>
            <li>
              <strong>পেমেন্ট তথ্য:</strong> ম্যানুয়াল bKash/Nagad/Rocket
              ট্রাঞ্জ্যাকশন আইডি ও সেন্ডার নম্বর। আমরা <strong>কখনোই</strong>{" "}
              আপনার মোবাইল ব্যাংকিং পিন বা OTP চাই না বা সংরক্ষণ করি না।
            </li>
            <li>
              <strong>রিভিউ ও মতামত:</strong> পণ্য সম্পর্কে আপনার লেখা
              রিভিউ, রেটিং, এবং কন্ট্যাক্ট ফর্মে পাঠানো বার্তা।
            </li>
            <li>
              <strong>টেকনিক্যাল ডেটা:</strong> IP ঠিকানা, ব্রাউজার, ডিভাইস
              এবং অপারেটিং সিস্টেম তথ্য — শুধু সাইটের কর্মক্ষমতা ও নিরাপত্তা
              বজায় রাখার জন্য।
            </li>
            <li>
              <strong>পুশ নোটিফিকেশন:</strong> আপনি অপ্ট-ইন করলে আপনার
              ব্রাউজার থেকে দেওয়া অ্যানোনিমাস সাবস্ক্রিপশন এন্ডপয়েন্ট।
            </li>
          </ul>
        </Block>

        <Block
          icon={<UserCheck className="h-5 w-5" />}
          title="৩. কেন আমরা এই তথ্য সংগ্রহ করি"
        >
          <ul className="space-y-2 list-disc pl-5">
            <li>আপনার অর্ডার প্রসেস, প্যাকেজিং এবং ডেলিভারি নিশ্চিত করতে।</li>
            <li>অর্ডার ট্র্যাকিং, কাস্টমার সাপোর্ট ও SMS/ইমেইল আপডেট পাঠাতে।</li>
            <li>পেমেন্ট যাচাই ও বিরোধ সমাধানে।</li>
            <li>সাইটের মান উন্নত করতে এবং প্রতারণা প্রতিরোধে।</li>
            <li>আইনগত বাধ্যবাধকতা পূরণে (যেমন ট্যাক্স রেকর্ড)।</li>
            <li>
              আপনার সম্মতি থাকলে নতুন আমের আগমন বা অফার সম্পর্কে নোটিফিকেশন
              পাঠাতে।
            </li>
          </ul>
        </Block>

        <Block
          icon={<Shield className="h-5 w-5" />}
          title="৪. তথ্য কাদের সাথে শেয়ার করি"
        >
          <p>
            আমরা <strong>কখনোই</strong> আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষের
            কাছে বিক্রি করি না। তবে অর্ডার সম্পন্ন করার জন্য নিম্নলিখিত
            বিশ্বস্ত সেবা প্রদানকারীদের সাথে শেয়ার করতে হয়:
          </p>
          <ul className="space-y-2 list-disc pl-5 mt-3">
            <li>
              <strong>Supabase (ক্লাউড ডেটাবেস):</strong> অর্ডার ও অ্যাকাউন্ট
              ডেটা এনক্রিপ্টেড অবস্থায় সংরক্ষণে।
            </li>
            <li>
              <strong>কুরিয়ার / ডেলিভারি কোম্পানি:</strong> আপনার নাম, ফোন
              এবং ঠিকানা — শুধু পণ্য পৌঁছানোর জন্য।
            </li>
            <li>
              <strong>মোবাইল ফাইন্যান্সিয়াল সার্ভিস (bKash, Nagad, Rocket):</strong>{" "}
              আপনি সরাসরি তাদের কাছে পেমেন্ট করেন; আমরা শুধু ট্রাঞ্জ্যাকশন
              আইডি যাচাই করি।
            </li>
            <li>
              <strong>আইন প্রয়োগকারী সংস্থা:</strong> বৈধ আদেশ থাকলে।
            </li>
          </ul>
        </Block>

        <Block icon={<Cookie className="h-5 w-5" />} title="৫. কুকিজ ও স্টোরেজ">
          <p>
            আমরা আপনার অভিজ্ঞতা উন্নত করতে কুকিজ এবং ব্রাউজার-লোকাল স্টোরেজ
            ব্যবহার করি — যেমন:
          </p>
          <ul className="space-y-2 list-disc pl-5 mt-3">
            <li>
              <strong>সেশন কুকি:</strong> সাইন-ইন অবস্থা ধরে রাখতে।
            </li>
            <li>
              <strong>localStorage:</strong> আপনার শপিং কার্ট সংরক্ষণে — এই
              ডেটা আমাদের সার্ভারে যায় না।
            </li>
            <li>
              <strong>প্রেফারেন্স কুকি:</strong> আপনার পছন্দ মনে রাখতে।
            </li>
          </ul>
          <p className="mt-3">
            আপনি ব্রাউজার সেটিংস থেকে যেকোনো সময় কুকি মুছে দিতে পারেন। তবে
            এতে কিছু ফিচার (যেমন কার্ট ও সাইন-ইন) ঠিকমতো কাজ নাও করতে পারে।
          </p>
        </Block>

        <Block
          icon={<Lock className="h-5 w-5" />}
          title="৬. ডেটা সুরক্ষা"
        >
          <p>
            আপনার তথ্য রক্ষায় আমরা যে ব্যবস্থা নিই:
          </p>
          <ul className="space-y-2 list-disc pl-5 mt-3">
            <li>HTTPS/TLS এনক্রিপশন — সব ডেটা ট্রান্সমিশনে।</li>
            <li>পাসওয়ার্ড bcrypt-এ হ্যাশ করে সংরক্ষিত (আমরা plain text পাসওয়ার্ড দেখি না)।</li>
            <li>Row-Level Security — ডেটাবেস লেভেলে আপনার ডেটা শুধু আপনিই দেখতে পারেন।</li>
            <li>নিয়মিত সিকিউরিটি অডিট ও ব্যাকআপ।</li>
          </ul>
          <p className="mt-3">
            তবে কোনো ইন্টারনেট সেবাই ১০০% সুরক্ষিত নয়। কোনো ব্যত্যয় ঘটলে আমরা
            আইনগত প্রয়োজন অনুযায়ী আপনাকে অবহিত করব।
          </p>
        </Block>

        <Block
          icon={<UserCheck className="h-5 w-5" />}
          title="৭. আপনার অধিকার"
        >
          <p>আপনার নিম্নলিখিত অধিকার রয়েছে:</p>
          <ul className="space-y-2 list-disc pl-5 mt-3">
            <li>
              <strong>অ্যাক্সেস:</strong> আমরা আপনার সম্পর্কে কী তথ্য রেখেছি
              তা জানার অধিকার।
            </li>
            <li>
              <strong>সংশোধন:</strong> ভুল তথ্য সংশোধনের অনুরোধ।
            </li>
            <li>
              <strong>ডিলিট (&ldquo;মুছে ফেলার অধিকার&rdquo;):</strong> আপনার
              অ্যাকাউন্ট ও সম্পর্কিত ডেটা স্থায়ীভাবে মুছে ফেলার অনুরোধ। অর্ডার
              ইতিহাস ট্যাক্স/হিসাব আইন অনুযায়ী ৬ বছর পর্যন্ত রাখতে হতে পারে।
            </li>
            <li>
              <strong>অপ্ট-আউট:</strong> মার্কেটিং নোটিফিকেশন থেকে যেকোনো
              সময় বের হয়ে যাওয়া।
            </li>
            <li>
              <strong>রিভিউ ডিলিট:</strong> নিজের লেখা রিভিউ যেকোনো সময় মুছে
              ফেলা।
            </li>
          </ul>
          <p className="mt-3">
            যেকোনো অনুরোধের জন্য আমাদের ইমেইল করুন:{" "}
            <a
              href={`mailto:${businessEmail}`}
              className="text-mango-700 underline font-semibold"
            >
              {businessEmail}
            </a>
          </p>
        </Block>

        <Block
          icon={<Baby className="h-5 w-5" />}
          title="৮. শিশুদের প্রাইভেসি"
        >
          <p>
            আমাদের সেবা ১৩ বছরের কম বয়সী শিশুদের জন্য নয়। আমরা ইচ্ছাকৃতভাবে
            শিশুদের তথ্য সংগ্রহ করি না। অভিভাবক হিসেবে আপনি যদি জানতে পারেন
            আপনার সন্তান আমাদের সাইটে তথ্য দিয়েছে, অনুগ্রহ করে যোগাযোগ করুন —
            আমরা তা দ্রুত মুছে দেব।
          </p>
        </Block>

        <Block
          icon={<RefreshCw className="h-5 w-5" />}
          title="৯. পলিসি পরিবর্তন"
        >
          <p>
            আমরা সময়ে সময়ে এই পলিসি হালনাগাদ করতে পারি। বড় পরিবর্তন হলে
            ওয়েবসাইট ব্যানার বা ইমেইলে আপনাকে জানানো হবে। &ldquo;সর্বশেষ
            হালনাগাদ&rdquo; তারিখটি পেজের উপরে দেখানো হয়। নতুন পলিসি প্রকাশের
            পর সাইট ব্যবহার চালিয়ে গেলে তা আপনার সম্মতি হিসেবে গণ্য হবে।
          </p>
        </Block>

        <Block icon={<Mail className="h-5 w-5" />} title="১০. যোগাযোগ">
          <p>
            এই প্রাইভেসি পলিসি সম্পর্কে কোনো প্রশ্ন, অভিযোগ বা অনুরোধ থাকলে
            আমাদের সাথে যোগাযোগ করুন:
          </p>
          <ul className="space-y-2 mt-3">
            <li>
              <strong>ইমেইল:</strong>{" "}
              <a
                href={`mailto:${businessEmail}`}
                className="text-mango-700 underline"
              >
                {businessEmail}
              </a>
            </li>
            <li>
              <strong>ফোন / WhatsApp:</strong>{" "}
              <a
                href={`tel:${businessPhone}`}
                className="text-mango-700 underline"
              >
                {businessPhone}
              </a>
            </li>
            <li>
              <strong>ঠিকানা:</strong> নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ,
              রাজশাহী, বাংলাদেশ
            </li>
          </ul>
          <p className="mt-4">
            আপনি{" "}
            <Link href="/contact" className="text-mango-700 underline font-semibold">
              কন্ট্যাক্ট ফর্ম
            </Link>
            -ও ব্যবহার করতে পারেন।
          </p>
        </Block>
      </section>
    </>
  );
}

function Block({
  icon,
  title,
  children
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="glass rounded-3xl p-6 sm:p-8">
      <header className="flex items-center gap-3 mb-4">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-mango-gradient shrink-0">
          {icon}
        </div>
        <h2 className="font-display-bn text-xl sm:text-2xl font-bold text-ink">
          {title}
        </h2>
      </header>
      <div className="text-sm sm:text-base text-ink/75 leading-relaxed space-y-2">
        {children}
      </div>
    </article>
  );
}
