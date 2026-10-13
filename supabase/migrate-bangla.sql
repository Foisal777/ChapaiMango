-- ============================================================
-- Chapai Mango House — Bengali content migration
-- Run this in Supabase SQL Editor IF you already seeded the original
-- English data (the seed in schema.sql uses ON CONFLICT DO NOTHING,
-- so existing rows are not updated on re-run). This script forces
-- the existing rows to the new Bengali names + Nachole address.
-- Safe to run multiple times.
-- ============================================================

update public.products
set
  name              = 'প্রিমিয়াম হিমসাগর',
  short_description = 'বাংলা আমের রাজা — মিষ্টি, রসালো, সুগন্ধি।',
  description       = 'চাঁপাইনবাবগঞ্জের গাছপাকা হিমসাগর। আঁশহীন মসৃণ শাঁস, কম শাঁসে অসাধারণ মিষ্টি স্বাদ। একবার খেলে বারবার মনে পড়বে।',
  origin            = 'নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, বাংলাদেশ',
  season            = 'মে – জুন'
where slug = 'himsagar';

update public.products
set
  name              = 'ল্যাংড়া (বানারসি)',
  short_description = 'সবুজ-সোনালি রঙ, অসাধারণ মিষ্টি আম।',
  description       = 'বানারসি হেরিটেজ জাত — পাতলা খোসা, মাখনের মতো নরম শাঁস। চাঁপাইয়ের মাটি ও আবহাওয়ায় ল্যাংড়া দুনিয়াবিখ্যাত।',
  origin            = 'নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, বাংলাদেশ',
  season            = 'জুন – জুলাই'
where slug = 'langra';

update public.products
set
  name              = 'ক্ষীরসাপাত',
  short_description = 'GI ট্যাগ পাওয়া চাঁপাইয়ের গৌরব।',
  description       = 'Geographical Indication (GI) নিবন্ধিত ক্ষীরসাপাত — সংরক্ষিত ঐতিহ্য। অত্যন্ত মিষ্টি, হলুদ মাখনের মতো শাঁস, ফাইবার-মুক্ত।',
  origin            = 'নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, বাংলাদেশ',
  season            = 'মে – জুলাই'
where slug = 'khirsapat';

update public.products
set
  name              = 'ফজলি',
  short_description = 'বড় সাইজ, লেট সিজন — আচার ও ক্ষীরের জন্য সেরা।',
  description       = 'প্রতি ফল ৭০০গ্রাম–১.২ কেজি। লেট-সিজন আম (জুলাই–আগস্ট)। আচার, জ্যাম, ও পাকা খাওয়ার জন্য চমৎকার।',
  origin            = 'নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, বাংলাদেশ',
  season            = 'জুলাই – আগস্ট'
where slug = 'fazli';

update public.products
set
  name              = 'আম্রপালি',
  short_description = 'হাইব্রিড জাত — ছোট, ঘন মিষ্টি, ফাইবার-মুক্ত।',
  description       = 'দশেহারি + নিলাম-এর হাইব্রিড। অত্যন্ত মিষ্টি, ফাইবার কম, লাল-হলুদ রঙ। ছোট পরিবারের জন্য পারফেক্ট।',
  origin            = 'নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, বাংলাদেশ',
  season            = 'জুন – জুলাই'
where slug = 'amrapali';

update public.products
set
  name              = 'গোপালভোগ',
  short_description = 'সিজনের প্রথম আম — মে মাসের শুরুতেই পাবেন।',
  description       = 'মৌসুমের প্রথম আম। চামড়া পাতলা, সুগন্ধে ভরা, মিষ্টি-টক ব্যালান্স। রমজান/ঈদের প্রিয় আম।',
  origin            = 'নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, বাংলাদেশ',
  season            = 'মে'
where slug = 'gopalbhog';

-- Catch-all: any other product still using the old origin gets updated.
update public.products
set origin = 'নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, বাংলাদেশ'
where origin in (
  'Chapainawabganj, Bangladesh',
  'Chapai Nawabganj, Bangladesh'
);

-- Testimonials -> Bengali
update public.testimonials
set name = 'রাশেদ খান',
    location = 'ঢাকা',
    message = 'অনেক দিন পর এত ফ্রেশ আম পেলাম। প্যাকেজিং একদম সেফ, একটাও নষ্ট হয়নি। ইনশাআল্লাহ আবার অর্ডার করব।'
where name = 'Rashed Khan';

update public.testimonials
set name = 'নুসরাত জাহান',
    location = 'চট্টগ্রাম',
    message = 'ক্ষীরসাপাতের স্বাদ একদম চাঁপাইয়ের মতো — যত দিন থাকব Chapai Mango House থেকেই নেব।'
where name = 'Nusrat Jahan';

update public.testimonials
set name = 'তানভীর আহমেদ',
    location = 'সিলেট',
    message = 'দাম রিজনেবল, ডেলিভারি ফাস্ট। পরিবারের জন্য গিফট হিসেবে পাঠিয়েছিলাম, সবাই খুশি।'
where name = 'Tanvir Ahmed';
