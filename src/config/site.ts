/**
 * BongoSell AI - Site Configuration & Data Source
 * Centralized configuration making brand name, pricing, limits, and content easily editable.
 */

export interface PricingPlan {
  id: string;
  name: string;
  nameBn: string;
  tagline: string;
  taglineBn: string;
  priceMonthly: number;
  priceAnnual: number;
  popular?: boolean;
  limits: {
    conversationsPerMonth: string;
    productsCount: string;
    facebookPages: number;
    teamMembers: number;
    responseTime: string;
  };
  features: string[];
  featuresBn: string[];
  ctaText: string;
  ctaTextBn: string;
}

export interface FeatureItem {
  id: string;
  iconName: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  highlight: string;
  highlightBn: string;
}

export interface OnboardingStep {
  step: number;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  status: 'available_now' | 'meta_integration_phase2';
  badgeLabel: string;
  badgeLabelBn: string;
}

export interface FAQItem {
  id: string;
  question: string;
  questionBn: string;
  answer: string;
  answerBn: string;
  category: 'general' | 'ai' | 'fcommerce' | 'billing';
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  summary: string;
  summaryBn: string;
  contentBn: string;
  contentEn: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  category: string;
  image: string;
}

export interface ChatScenario {
  id: string;
  name: string;
  nameBn: string;
  businessType: string;
  businessTypeBn: string;
  messages: Array<{
    sender: 'customer' | 'ai' | 'system';
    text: string;
    time: string;
    orderCard?: {
      product: string;
      price: string;
      delivery: string;
      customerName: string;
      phone: string;
      address: string;
      payment: string;
    };
  }>;
}

export const SITE_CONFIG = {
  brandName: 'BongoSell AI',
  brandWordmark: 'BongoSell',
  brandAccent: 'AI',
  taglineBn: 'আপনার Facebook Inbox সামলাবে AI, আপনি বাড়াবেন বিক্রি',
  taglineEn: 'AI handles your Facebook Messenger inbox while you scale your sales',
  descriptionBn: 'বাংলাদেশের F-Commerce উদ্যোক্তাদের জন্য স্পেশালাইজড বাংলা ও বাংলিশ চ্যাটবট। ২৪/৭ কাস্টমার রিপ্লাই, প্রোডাক্ট ক্যাটালগ ও অর্ডার কালেকশন।',
  descriptionEn: 'Conversational Bangla & Banglish AI chatbot platform tailored for Bangladeshi Facebook shop owners and online retailers.',
  currencySymbol: '৳',
  currencyCode: 'BDT',
  supportEmail: 'support@bongosell.ai',
  supportPhone: '+880 1800-BONGO (26646)',
  location: 'Dhaka, Bangladesh',
  statusPhase: 'Phase 1 Frontend Architecture & Design Preview',
  
  navLinks: [
    { label: 'Features', labelBn: 'ফিচারসমূহ', href: '/features' },
    { label: 'How It Works', labelBn: 'কীভাবে কাজ করে', href: '/how-it-works' },
    { label: 'Pricing', labelBn: 'প্রাইসিং', href: '/pricing' },
    { label: 'FAQ', labelBn: 'সাধারণ জিজ্ঞাসা', href: '/faq' },
    { label: 'Blog', labelBn: 'ব্লগ', href: '/blog' },
  ],

  trustPoints: [
    {
      titleBn: '২৪/৭ ইনস্ট্যান্ট রেসপন্স',
      titleEn: '24/7 Instant Responses',
      descBn: 'রাত ৩টায় মেসেজ দিলেও কাস্টমার পাবে সেকেন্ডে সঠিক রিপ্লাই।',
      descEn: 'Instant answers even during midnight rush hours.',
    },
    {
      titleBn: 'বাংলা ও বাংলিশ এক্সপার্ট',
      titleEn: 'Native Bangla & Banglish NLP',
      descBn: '"bhaiya delivery charge koto?" বা "প্রোডাক্টের সাইজ কি কি?" সহজেই বোঝে।',
      descEn: 'Natural understanding of colloquial Bangladeshi shopping queries.',
    },
    {
      titleBn: 'সেলার-কন্ট্রোলড প্রাইসিং রুল',
      titleEn: 'Seller Pricing Guardrails',
      descBn: 'ফিক্সড রেট অথবা মিনিমাম ডিসকাউন্ট লিমিটের বাইরে কখনো অফার দেবে না।',
      descEn: 'Strict seller rules so AI never undercuts your profit margins.',
    },
    {
      titleBn: 'স্মার্ট অর্ডার কালেকশন',
      titleEn: 'Zero-Friction Order Intake',
      descBn: 'নাম, মোবাইল নম্বর ও ফুল অ্যাড্রেস ভেরিফাই করে কনফার্মেশন ফরম্যাট তৈরি করে।',
      descEn: 'Accurately captures delivery addresses, phone numbers, and COD details.',
    },
    {
      titleBn: 'হিউম্যান টেকওভার মোড',
      titleEn: 'Seamless Human Handover',
      descBn: 'জটিল কাস্টমার প্রশ্নে এক ক্লিকে পেইজ অ্যাডমিন নিজে চ্যাটে যোগ দিতে পারেন।',
      descEn: 'Admins can step into the chat anytime with single-click takeover.',
    },
  ],

  pricingPlans: [
    {
      id: 'starter',
      name: 'Starter Plan',
      nameBn: 'স্টার্টার প্ল্যান',
      tagline: 'Ideal for emerging boutique pages and home-based shops',
      taglineBn: 'নতুন বা উদীয়মান ফেসবুক পেইজ ও হোম-মেকারদের জন্য আদর্শ',
      priceMonthly: 999,
      priceAnnual: 849, // billed annually (approx 15% savings)
      popular: false,
      limits: {
        conversationsPerMonth: '১,০০০ চ্যাট / মাস',
        productsCount: '৫০ টি প্রোডাক্ট ক্যাটালগ',
        facebookPages: 1,
        teamMembers: 1,
        responseTime: '< ১ সেকেন্ড',
      },
      features: [
        '1 Facebook Page Connection',
        'Bangla & Banglish AI Conversational Engine',
        'Product Catalog QA & Stock Queries',
        'Basic Order Details Collection (Name, Phone, Address)',
        'Human Admin Takeover Mode',
        'Standard Email Support',
      ],
      featuresBn: [
        '১টি ফেসবুক পেইজ কানেকশন',
        'বাংলা ও বাংলিশ ন্যাচারাল চ্যাট ইঞ্জিন',
        'প্রোডাক্ট ক্যাটালগ ও স্টক সংক্রান্ত প্রশ্নোত্তর',
        'অটোমেটিক কাস্টমার নাম, ফোন ও ঠিকানা সংগ্রহ',
        'হিউম্যান অ্যাডমিন টেকওভার মোড',
        'স্ট্যান্ডার্ড ইমেইল সাপোর্ট',
      ],
      ctaText: 'Choose Starter',
      ctaTextBn: 'স্টার্টার সিলেক্ট করুন',
    },
    {
      id: 'growth',
      name: 'Growth Plan',
      nameBn: 'গ্রোথ প্ল্যান',
      tagline: 'For fast-growing clothing, cosmetics, and electronics sellers',
      taglineBn: 'দ্রুত বর্ধনশীল বুটিক, কসমেটিক্স ও গ্যাজেট শপের সেরা পছন্দ',
      priceMonthly: 2499,
      priceAnnual: 2099,
      popular: true,
      limits: {
        conversationsPerMonth: '৫,০০০ চ্যাট / মাস',
        productsCount: '২৫০ টি প্রোডাক্ট ক্যাটালগ',
        facebookPages: 2,
        teamMembers: 3,
        responseTime: '< ০.৫ সেকেন্ড',
      },
      features: [
        '2 Facebook Pages Connected',
        'Advanced Bangla/Banglish Intent Detection',
        'Custom Price Guardrails & Secret Seller Discount Rules',
        'Curated Upsell & Cross-sell Suggestions',
        'Pathao & RedX Delivery Charge Auto-Estimator helper',
        'WhatsApp Alert for Urgent Inquiries',
        'Priority Phone & Chat Support',
      ],
      featuresBn: [
        '২টি ফেসবুক পেইজ কানেকশন',
        'উন্নত বাংলা/বাংলিশ ইনটেন্ট ডিটেকশন',
        'কাস্টম প্রাইসিং রুল ও ডিসকাউন্ট লিমিট কন্ট্রোল',
        'রিলেটেড প্রোডাক্ট আপসেল ও ম্যাচিং রেকমেন্ডেশন',
        'পাঠাও ও রেডএক্স ডেলিভারি চার্জ অটো ক্যালকুলেশন',
        'জরুরি অর্ডারের জন্য ইনস্ট্যান্ট নোটিফিকেশন',
        'প্রায়োরিটি সাপোর্ট ও দ্রুত অনবোর্ডিং গাইড',
      ],
      ctaText: 'Start 14-Day Free Trial',
      ctaTextBn: '১৪ দিনের ফ্রি ট্রায়াল শুরু করুন',
    },
    {
      id: 'business',
      name: 'Business Pro',
      nameBn: 'বিজনেস প্রো',
      tagline: 'For established brands running high-volume live sales and ads',
      taglineBn: 'হাই-ভলিউম মেসেজ, লাইভ সেলস ও মাল্টি-অ্যাডমিন ব্র্যান্ডের জন্য',
      priceMonthly: 4999,
      priceAnnual: 4199,
      popular: false,
      limits: {
        conversationsPerMonth: '১৫,০০০ চ্যাট / মাস',
        productsCount: 'আনলিমিটেড প্রোডাক্ট ক্যাটালগ',
        facebookPages: 5,
        teamMembers: 10,
        responseTime: '< ০.৩ সেকেন্ড (হাই প্রায়োরিটি)',
      },
      features: [
        'Up to 5 Facebook Pages',
        'High-Volume Concurrency for Facebook Live Drops',
        'Multi-Agent Staff Routing (Sales vs Support)',
        'Fraud Order Warning & Repeat Customer Detection',
        'Courier API Integration Hooks (Phase 2)',
        'Custom Fine-Tuning on Page Chat History',
        'Dedicated Bangladeshi Account Manager',
      ],
      featuresBn: [
        'সর্বোচ্চ ৫টি ফেসবুক পেইজ সাপোর্ট',
        'ফেসবুক লাইভ চলাকালীন একসাথে শত শত ইনবক্স হ্যান্ডলিং',
        'মাল্টি-এজেন্ট টিম পারমিশন ও রোল ম্যানেজমেন্ট',
        'সন্দেহজনক ফেক অর্ডার ওয়ার্নিং ও রিপিট কাস্টমার হিস্ট্রি',
        'কুরিয়ার ট্র্যাকিং এপিআই হুকস (ফেজ ২)',
        'পেইজের অতীত চ্যাট অনুযায়ী কাস্টম এআই টিউনিং',
        'ডেডিকেটেড অ্যাকাউন্ট ম্যানেজার সাপোর্ট',
      ],
      ctaText: 'Choose Business Pro',
      ctaTextBn: 'বিজনেস প্রো সিলেক্ট করুন',
    },
  ],

  featuresList: [
    {
      id: 'bangla_first_nlp',
      iconName: 'MessageSquareText',
      title: 'Bangla-First AI Conversations',
      titleBn: 'ন্যাচারাল বাংলা ও বাংলিশ কথোপকথন',
      description: 'Understands regional phrasing, colloquial spelling, and Romanized Banglish without rigid keyword triggers.',
      descriptionBn: 'আঞ্চলিক বাণান, চলিত ভাষা কিংবা রোমান বাংলিশ (যেমন "bhai dam koto") স্বাভাবিকভাবে বুঝতে পারে। কোনো রোবটিক ড্রপডাউন ছাড়াই ফ্রেন্ডলি উত্তর দেয়।',
      highlight: '99% understanding of casual F-Commerce colloquial terms.',
      highlightBn: 'F-Commerce এর সাধারণ কথ্য ভাষার ৯৯% নিখুঁত অনুধাবন।',
    },
    {
      id: 'catalog_qa',
      iconName: 'Layers',
      title: 'Product Catalog & Variant Queries',
      titleBn: 'ক্যাটালগ ও ভ্যারিয়েন্ট প্রশ্নোত্তর',
      description: 'Instant answers to size guides, color availability, fabric details, warranty, and real product specifications.',
      descriptionBn: 'শাড়ির ফেব্রিক, ড্রেসের সাইজ চার্ট, ইয়ারবাডের ওয়ারেন্টি কিংবা ক্রিম এর স্কিন টাইপ—সবকিছু আপনার ক্যাটালগ ডাটা থেকে ইনস্ট্যান্ট বুঝিয়ে বলে।',
      highlight: 'Zero hallucinations: strictly answers from your uploaded product rules.',
      highlightBn: 'ভুল তথ্য দেয় না: শুধুমাত্র আপনার দেয়া নির্দিষ্ট নিয়মে উত্তর প্রদান করে।',
    },
    {
      id: 'pricing_guardrails',
      iconName: 'ShieldCheck',
      title: 'Seller-Configured Price Rules',
      titleBn: 'সেলার-নির্ধারিত প্রাইস ও ডিসকাউন্ট রুল',
      description: 'Set fixed prices, maximum allowable discounts (e.g., max 50 TK off on 2 items), and delivery charge policies.',
      descriptionBn: 'কাস্টমার দামাদামি করলেও আপনার ঠিক করে দেয়া মিনিমাম প্রাইস বা ম্যাক্সিমাম ডিসকাউন্টের নিচে এআই কখনোই নামবে না। আপনার মার্জিন সুরক্ষিত থাকে।',
      highlight: 'Strict bounds prevent AI from accidentally lowering your profit.',
      highlightBn: 'কঠোর নীতিমালা নিশ্চিত করে যে আপনার লাভের অংশ অক্ষুণ্ণ থাকবে।',
    },
    {
      id: 'order_collection',
      iconName: 'ShoppingBag',
      title: 'Automatic Order Collection',
      titleBn: 'অটোমেটিক অর্ডার কালেকশন ও ভেরিফিকেশন',
      description: 'Extracts customer name, mobile number, full delivery address, and preferred courier with structured confirmation cards.',
      descriptionBn: 'মেসেঞ্জারে আলাপের মাঝেই কাস্টমারের নাম, ১১ ডিজিটের বাংলাদেশি ফোন নাম্বার ও ডেলিভারি ঠিকানা সংগ্রহ করে সুন্দর সামারি তৈরি করে।',
      highlight: 'Eliminates repetitive back-and-forth asking for customer details.',
      highlightBn: 'বারবার "আপনার নাম্বার দিন, ঠিকানা দিন" চাওয়ার ঝামেলা দূর হয়।',
    },
    {
      id: 'human_takeover',
      iconName: 'UserCheck',
      title: 'Instant Human Takeover',
      titleBn: 'এক ক্লিকে মানুষের হাতে নিয়ন্ত্রণ',
      description: 'Page admins can pause AI and take over any thread in real-time if a customer demands custom assistance.',
      descriptionBn: 'কখনো স্পেশাল কাস্টমার বা কাস্টম রিকোয়ারমেন্ট আসলে অ্যাডমিন মেসেঞ্জারে রিপ্লাই দেওয়া মাত্রই এআই নিজে থেকে পজ হয়ে যায়।',
      highlight: 'Fluid transition between AI automation and personal relationship building.',
      highlightBn: 'এআই ও মানুষের চমৎকার সমন্বয় যাতে কোনো কাস্টমার অসন্তুষ্ট না হয়।',
    },
    {
      id: 'analytics_history',
      iconName: 'BarChart3',
      title: 'Usage Analytics & Trends',
      titleBn: 'ইনবক্স অ্যানালিটিক্স ও সেলস ট্রেন্ড',
      description: 'Monitor daily message volume, peak buying hours, top-asked products, and lead-to-order conversion ratios.',
      descriptionBn: 'কোন প্রোডাক্টের অনুসন্ধান বেশি, কাস্টমাররা দিনের কোন সময়ে বেশি নক করে এবং কত শতাংশ চ্যাট অর্ডারে রূপান্তরিত হচ্ছে তার রিয়েল-টাইম তথ্য।',
      highlight: 'Actionable insights to restock trending products faster.',
      highlightBn: 'ইনবক্স ডেটা অ্যানালাইসিস করে পরবর্তী স্টক ও ক্যাম্পেইন প্ল্যান করুন।',
    },
  ],

  howItWorksSteps: [
    {
      step: 1,
      title: 'Create Your Account',
      titleBn: '১. অ্যাকাউন্ট তৈরি করুন',
      description: 'Sign up in under 60 seconds with your business email, shop name, and category. Configure your primary shop language.',
      descriptionBn: 'আপনার বিজনেস ইমেইল, পেইজের নাম এবং শপ ক্যাটাগরি (পোশাক, কসমেটিক্স, গ্যাজেট ইত্যাদি) দিয়ে দ্রুত অ্যাকাউন্ট রেজিস্ট্রেশন করুন।',
      status: 'available_now',
      badgeLabel: 'Phase 1 Ready',
      badgeLabelBn: 'ফেজ ১ এ প্রস্তুত',
    },
    {
      step: 2,
      title: 'Connect Facebook Page',
      titleBn: '২. ফেসবুক পেইজ কানেক্ট করুন',
      description: 'Authorize Meta Messenger permissions through the official Facebook login dialog. Select the business page you want automated.',
      descriptionBn: 'ফেসবুকের অফিসিয়াল সিকিউর ডায়ালগ ব্যবহার করে আপনার পেইজটি কানেক্ট করুন। (ফেজ ২ এ মেটা এপিআই ইন্টিগ্রেশন চালু হবে)।',
      status: 'meta_integration_phase2',
      badgeLabel: 'Meta Integration (Phase 2)',
      badgeLabelBn: 'মেটা এপিআই (ফেজ ২ এ আসছে)',
    },
    {
      step: 3,
      title: 'Add Products & Business Policies',
      titleBn: '৩. প্রোডাক্ট তালিকা ও বিক্রির নিয়ম দিন',
      description: 'Input your products, prices, stock notes, delivery charges (Inside Dhaka ৳70, Outside ৳130), and return/exchange policies.',
      descriptionBn: 'আপনার প্রোডাক্টের দাম, স্টক, সাইজ, ডেলিভারি চার্জ (যেমন: ঢাকার ভেতরে ৳৭০, বাইরে ৳১৩০) এবং রিটার্ন পলিসি এআই ড্যাশবোর্ডে সেট করুন।',
      status: 'available_now',
      badgeLabel: 'Config Engine Ready',
      badgeLabelBn: 'কনফিগ ইঞ্জিন প্রস্তুত',
    },
    {
      step: 4,
      title: 'Test AI & Activate 24/7 Automation',
      titleBn: '৪. চ্যাট টেস্ট করুন এবং অটোমেশন অন করুন',
      description: 'Simulate customer conversations in the sandbox. When satisfied with answers and pricing accuracy, switch to Live mode.',
      descriptionBn: 'স্যান্ডবক্সে নিজে টেস্ট মেসেজ পাঠিয়ে এআই এর উত্তর যাচাই করুন। সবকিছু মনমতো হলে এক ক্লিকে লাইভ অটোমেশন অন করে দিন।',
      status: 'available_now',
      badgeLabel: 'Interactive Sandbox Ready',
      badgeLabelBn: 'ইন্টারেক্টিভ টেস্ট প্রস্তুত',
    },
  ],

  faqList: [
    {
      id: 'faq-1',
      category: 'ai' as const,
      question: 'How does the AI work on Facebook Messenger?',
      questionBn: 'ফেসবুক মেসেঞ্জারে এআই কীভাবে কাজ করে?',
      answer: 'When a customer sends a message to your Facebook Page, BongoSell AI receives the message via official Meta Graph webhooks, analyzes the query using natural language processing specialized for Bangladeshi commerce, checks your product rules and inventory, and immediately replies in natural Bangla or Banglish.',
      answerBn: 'যখন কোনো কাস্টমার আপনার ফেসবুক পেইজে মেসেজ পাঠান, তখন এআই মেসেজটি বুঝে আপনার ক্যাটালগ ও নিয়মের সাথে মিলিয়ে সেকেন্ডের মধ্যে স্বাভাবিক বাংলা অথবা বাংলিশে উত্তর দেয়। এটি কোনো সাধারণ কি-ওয়ার্ড বট নয়, বরং সম্পূর্ণ ডায়ালগ বুঝতে সক্ষম।',
    },
    {
      id: 'faq-2',
      category: 'ai',
      question: 'Can it understand both Bangla and Banglish?',
      questionBn: 'এটি কি বাংলা এবং বাংলিশ দুটোই বুঝতে পারে?',
      answer: 'Yes, absolutely. Most Bangladeshi buyers type in English letters (e.g. "bhai red color ta available ache? dam koto?"). BongoSell AI understands phonetic Banglish, formal Bangla script, and mixed English terms seamlessly.',
      answerBn: 'হ্যাঁ, সম্পূর্ণভাবে। বেশিরভাগ বাংলাদেশি ক্রেতা ইংরেজি অক্ষরে মেসেজ লেখেন (যেমন: "bhaiya delivery charge koto?"). বংগোসেল এআই রোমান বাংলিশ, প্রমিত বাংলা লিপি এবং মিশ্র ইংরেজি শব্দ অত্যন্ত দক্ষতার সাথে প্রসেস করে।',
    },
    {
      id: 'faq-3',
      category: 'fcommerce',
      question: 'How do I connect my Facebook Page?',
      questionBn: 'কীভাবে আমার ফেসবুক পেইজ কানেক্ট করব?',
      answer: 'In the upcoming Phase 2 production release, you will click "Connect Page", log in with your Facebook account, and select your Page. Meta will generate a secure Page Access Token with Messenger permissions. In Phase 1, you can preview the setup workflow and test the conversational engine.',
      answerBn: 'পরবর্তী ফেজ ২ তে আপনি সরাসরি "কানেক্ট পেইজ" বাটনে ক্লিক করে আপনার ফেসবুক আইডিতে লগইন করে পেইজ সিলেক্ট করবেন। ফেজ ১ এ আপনি পুরো অনবোর্ডিং ফ্লো এবং এআই ইঞ্জিনের কাজ সরাসরি ডেমোতে দেখতে পাচ্ছেন।',
    },
    {
      id: 'faq-4',
      category: 'fcommerce',
      question: 'Can I set minimum prices and prevent unwanted bargaining?',
      questionBn: 'আমি কি ন্যূনতম দাম সেট করে অযাচিত দামাদামি ঠেকাতে পারব?',
      answer: 'Yes. You define the exact pricing policy: whether a product is strictly fixed-price, or if the AI is allowed to offer a minor discount (e.g., maximum ৳50 discount only if the customer orders 2 items). The AI will never violate your minimum floor price.',
      answerBn: 'অবশ্যই। প্রতিটি প্রোডাক্টের ফিক্সড প্রাইস কিংবা ডিসকাউন্ট লিমিট (যেমন: ২টি অর্ডার করলে সর্বোচ্চ ৳৫০ ছাড়) আপনি নির্ধারণ করবেন। এআই আপনার নির্ধারিত সীমার বাইরে কখনো কম দামে বিক্রি করবে না।',
    },
    {
      id: 'faq-5',
      category: 'fcommerce',
      question: 'How are orders collected and organized?',
      questionBn: 'অর্ডারগুলো কীভাবে সংগ্রহ করা হয়?',
      answer: 'When a customer agrees to buy, the AI politely asks for their Full Name, 11-digit Bangladeshi Mobile Number, and complete Delivery Address (including Thana/District). Once provided, it compiles a structured Order Summary card for both the buyer and your dashboard.',
      answerBn: 'কাস্টমার প্রোডাক্ট নিতে চাইলে এআই তার নাম, ১১ সংখ্যার মোবাইল নাম্বার ও পূর্ণাঙ্গ ডেলিভারি ঠিকানা সংগ্রহ করে একটি সুবিন্যস্ত অর্ডার সামারি কার্ড তৈরি করে যাতে ক্যাশ অন ডেলিভারি পাঠাতে কোনো সমস্যা না হয়।',
    },
    {
      id: 'faq-6',
      category: 'billing',
      question: 'What happens when my monthly conversation limit ends?',
      questionBn: 'আমার প্ল্যানের মাসিক চ্যাট লিমিট শেষ হলে কী হবে?',
      answer: 'Your service will never abruptly shut off. You will receive an alert at 80% usage. If the limit is reached, you can easily top up additional conversations or upgrade to the next tier, or human admins can continue replying manually.',
      answerBn: 'আপনার ইনবক্স হঠাৎ বন্ধ হয়ে যাবে না। ৮০% লিমিট শেষ হলে নোটিফিকেশন পাবেন। এরপর প্রয়োজনমতো অতিরিক্ত চ্যাট টপ-আপ নিতে পারবেন অথবা বড় প্ল্যানে আপগ্রেড করতে পারবেন।',
    },
    {
      id: 'faq-7',
      category: 'billing',
      question: 'How does subscription billing work in Bangladesh?',
      questionBn: 'বাংলাদেশে সাবস্ক্রিপশন পেমেন্ট কীভাবে কাজ করবে?',
      answer: 'Plans will support local payment methods including bKash, Nagad, Rocket, and Bangladeshi Debit/Credit cards. During this Phase 1 preview, billing integration is not live and all plans are displayed for configuration and review.',
      answerBn: 'সাবস্ক্রিপশনের জন্য বিকাশ, নগদ, রকেট ও দেশীয় ডেবিট/ক্রেডিট কার্ড সাপোর্ট থাকবে। ফেজ ১ এ কোনো পেমেন্ট গেটওয়ে চালু করা হয়নি এবং সমস্ত প্রাইসিং তথ্য প্রিভিউ হিসেবে প্রদর্শিত হচ্ছে।',
    },
  ] as FAQItem[],

  demoScenarios: [
    {
      id: 'clothing',
      name: 'Boutique & Sarees',
      nameBn: 'বুটিক ও জামদানি শাড়ী',
      businessType: 'Traditional Clothing & Boutique',
      businessTypeBn: 'আভিজাত্য ফ্যাশন ও বুটিক',
      messages: [
        {
          sender: 'customer',
          text: 'আসসালামু আলাইকুম, ব্লু জামদানি শাড়ীটার প্রাইস কত? লাল পাড় আছে?',
          time: '11:42 PM',
        },
        {
          sender: 'ai',
          text: 'ওয়ালাইকুম আসসালাম আপু! আমাদের এক্সক্লুসিভ রয়েল ব্লু ঢাকাই জামদানি শাড়ির ফিক্সড প্রাইস ৩,২০০ টাকা। এতে লাল পাড় ও নিখুঁত সুতার কাজ রয়েছে। সাথে ব্লাউজ পিস অন্তর্ভুক্ত। ডেলিভারি কি ঢাকার ভেতরে হবে নাকি বাইরে?',
          time: '11:42 PM',
        },
        {
          sender: 'customer',
          text: 'Dhakar moddhe. 3000 tk te dewa jabe na?',
          time: '11:43 PM',
        },
        {
          sender: 'ai',
          text: 'আন্তরিকভাবে দুঃখিত আপু, আমাদের জামদানি ১০০% অথেনটিক তাঁতের তৈরি ও ফিক্সড প্রাইস। তবে ঢাকার ভেতরে আপনি ফুল ক্যাশ অন ডেলিভারি সুবিধা পাবেন এবং ডেলিভারি চার্জ মাত্র ৭০ টাকা। অর্ডার কনফার্ম করতে চাইলে আপনার নাম, ফোন নম্বর ও ফুল ঠিকানাটি দিন প্লিজ।',
          time: '11:43 PM',
        },
        {
          sender: 'customer',
          text: 'Acha thik ache, ami nibo. Name: Nusrat Jahan, 01711234567, House 12, Road 5, Dhanmondi, Dhaka.',
          time: '11:44 PM',
        },
        {
          sender: 'ai',
          text: 'অসংখ্য ধন্যবাদ আপু! আপনার অর্ডারটি ড্রাফট করা হয়েছে। অনুগ্রহ করে নিচের বিবরণটি দেখে কনফার্ম করুন:',
          time: '11:44 PM',
          orderCard: {
            product: 'রয়েল ব্লু ঢাকাই জামদানি শাড়ী (কোড: JMD-802)',
            price: '৳৩,২০০ + ৳৭০ (ঢাকার হোম ডেলিভারি) = মোট ৳৩,২৭০',
            delivery: '২৪–৪৮ ঘণ্টার মধ্যে ক্যাশ অন ডেলিভারি',
            customerName: 'Nusrat Jahan',
            phone: '01711234567',
            address: 'House 12, Road 5, Dhanmondi, Dhaka',
            payment: 'ক্যাশ অন ডেলিভারি (COD)',
          },
        },
      ],
    },
    {
      id: 'gadgets',
      name: 'Gadget & Tech Store',
      nameBn: 'গ্যাজেট ও ইলেকট্রনিক্স শপ',
      businessType: 'Smartphones & Accessories',
      businessTypeBn: 'স্মার্টফোন ও অরিজিনাল গ্যাজেট',
      messages: [
        {
          sender: 'customer',
          text: 'Bhaiya ANC Earbuds er battery backup koto hour? Warranty ache?',
          time: '02:15 AM',
        },
        {
          sender: 'ai',
          text: 'হ্যালো ভাইয়া! আমাদের Aura Pro ANC Earbuds-এ এক চার্জে পাবেন ৭ ঘণ্টা ব্যাকআপ এবং কেস সহ মোট ৩২ ঘণ্টা। এর সাথে পাচ্ছেন ৬ মাসের অফিসিয়াল রিপ্লেসমেন্ট ওয়ারেন্টি। প্রাইস ১,৮৫০ টাকা।',
          time: '02:15 AM',
        },
        {
          sender: 'customer',
          text: 'Original to? Chattogram a pathano jabe?',
          time: '02:16 AM',
        },
        {
          sender: 'ai',
          text: 'জি ভাইয়া, শতভাগ অরিজিনাল এবং ইনটেক বক্স। স্টিডিফাস্ট কুরিয়ারের মাধ্যমে পুরো চট্টগ্রামে হোম ডেলিভারি দিচ্ছি। ডেলিভারি চার্জ ১৩০ টাকা। চট্টগ্রাম পৌঁছাতে ২-৩ দিন লাগবে। আপনি কি অর্ডার কনফার্ম করতে চান?',
          time: '02:16 AM',
        },
        {
          sender: 'customer',
          text: 'Hae confirm koren. MD Tanvir, 01819998877, Nasirabad, Chattogram.',
          time: '02:17 AM',
        },
        {
          sender: 'ai',
          text: 'অর্ডারটি গ্রহণ করা হয়েছে ভাইয়া! নিচে আপনার রিসিট প্রিভিউ রইল:',
          time: '02:17 AM',
          orderCard: {
            product: 'Aura Pro ANC Earbuds (Matte Black) - 6M Warranty',
            price: '৳১,৮৫০ + ৳১৩০ (চট্টগ্রাম হোম ডেলিভারি) = মোট ৳১,৯৮০',
            delivery: 'কুরিয়ার ক্যাশ অন ডেলিভারি (২–৩ কার্যদিবস)',
            customerName: 'MD Tanvir',
            phone: '01819998877',
            address: 'Nasirabad, Chattogram',
            payment: 'ক্যাশ অন ডেলিভারি (প্যাকেট দেখে পেমেন্ট)',
          },
        },
      ],
    },
    {
      id: 'cosmetics',
      name: 'Organic Cosmetics',
      nameBn: 'কসমেটিক্স ও স্কিনকেয়ার',
      businessType: 'Skincare & Beauty Products',
      businessTypeBn: 'অর্গানিক স্কিনকেয়ার ও মেকআপ',
      messages: [
        {
          sender: 'customer',
          text: 'আপু এই ময়েশ্চারাইজারটা কি অয়েলি আর একনে প্রোন স্কিনের জন্য সুইটেবল?',
          time: '04:30 PM',
        },
        {
          sender: 'ai',
          text: 'জি আপু! এটি সম্পূর্ণ অয়েল-ফ্রি ও নন-কমেডোজেনিক জেল ফর্মুলার ময়েশ্চারাইজার। এতে থাকা সেন্টেলা ও নিয়াসিনামাইড ত্বকের অতিরিক্ত তেল ও ব্রণের লালচে ভাব কমাতে সাহায্য করে। প্রাইস ৮৫০ টাকা (১০০ মিলি)।',
          time: '04:30 PM',
        },
        {
          sender: 'customer',
          text: 'Eta r sathe sunblock ta nile discount hobe?',
          time: '04:31 PM',
        },
        {
          sender: 'ai',
          text: 'জি আপু! আমাদের উইকেন্ড কম্বো অফারে ময়েশ্চারাইজার + হাইড্রেটিং সানব্লক একসাথে নিলে আপনি পাচ্ছেন ১০০ টাকা ডিসকাউন্ট! মোট প্রাইস পড়বে মাত্র ১,৫০০ টাকা (পূর্বের দাম ১,৬০০ টাকা)। কম্বোটা পাঠিয়ে দিব?',
          time: '04:31 PM',
        },
        {
          sender: 'customer',
          text: 'Yes! Send to: Farzana Akter, 01923445566, Sector 4, Uttara, Dhaka.',
          time: '04:32 PM',
        },
        {
          sender: 'ai',
          text: 'দারুণ! আপনার কম্বো অর্ডারটি বুক করা হলো আপু। বিস্তারিত নিচে দেখে নিন:',
          time: '04:32 PM',
          orderCard: {
            product: 'অ্যাকনে কেয়ার জেল ময়েশ্চারাইজার + হাইড্রেটিং সানব্লক কম্বো',
            price: '৳১,৫০০ (১০০ টাকা কম্বো ডিসকাউন্ট সহ) + ৳৭০ ডেলিভারি = ৳১,৫৭০',
            delivery: 'উত্তরা, ঢাকা (২৪ ঘণ্টার মধ্যে হোম ডেলিভারি)',
            customerName: 'Farzana Akter',
            phone: '01923445566',
            address: 'Sector 4, Uttara, Dhaka',
            payment: 'ক্যাশ অন ডেলিভারি',
          },
        },
      ],
    },
  ],

  blogPosts: [
    {
      id: 'blog-1',
      slug: 'reduce-messenger-dropoff-fcommerce',
      title: 'How Instant Messenger AI Reduces Customer Drop-Off by 40% in Bangladesh',
      titleBn: 'মেসেঞ্জারে ইনস্ট্যান্ট এআই কীভাবে কাস্টমার ড্রপ-অফ ৪০% পর্যন্ত কমায়',
      summary: 'Practical strategies for Facebook sellers losing nighttime buyers when human admins are asleep.',
      summaryBn: 'রাত ১২টার পর যে কাস্টমাররা ইনবক্সে নক করে, তাদের সঠিক সময়ে উত্তর না দিলে ৭০% অন্য পেজ থেকে কিনে নেয়। জেনে নিন সমাধানের উপায়।',
      image: '/src/assets/images/blog_messenger_automation_1792423840992.jpg',
      date: 'October 15, 2026',
      readTime: '4 min read',
      author: 'Shahriar Rahman',
      authorRole: 'E-Commerce Growth Strategist',
      category: 'F-Commerce Tactics',
      contentBn: `বাংলাদেশে ফেসবুক শপিংয়ের মূল চালিকাশক্তি হলো বিশ্বাস ও গতি। জরিপে দেখা গেছে, ৬৩% ক্রেতা রাত ১০টা থেকে রাত ২টার মধ্যে প্রোডাক্ট দেখে মেসেজ পাঠান। অধিকাংশ বুটিক ও গ্যাজেট শপের অ্যাডমিন তখন ঘুমে থাকেন। সকালে যখন রিপ্লাই দেওয়া হয়, তখন সেই কাস্টমার ইতিমধ্যেই প্রতিযোগী কোনো পেজে অর্ডার করে ফেলেছেন। 
      
বংগোসেল এআই এর মতো ন্যাচারাল বাংলা চ্যাটবট এই গ্যাপটি শূন্যে নামিয়ে আনে। কাস্টমার যে ভাষাতেই লিখুক না কেন—"bhaiya stock ache?", "dam koto?", কিংবা সরাসরি ভ্যারিয়েন্ট জানতে চাইলে—এআই সাথে সাথে সঠিক উত্তর দিয়ে অর্ডার তথ্য সংগ্রহ করে রাখে। এতে বিজ্ঞাপনী খরচের শতভাগ রিটার্ন পাওয়া যায়।`,
      contentEn: `In Bangladesh, conversational speed drives conversions. Studies show over 60% of F-commerce inquiries happen during off-work hours. When potential customers wait 4 to 8 hours for a reply, cart abandonment skyrockets. Instant conversational AI in colloquial Bangla eliminates wait times and secures COD orders before intent fades.`,
    },
    {
      id: 'blog-2',
      slug: 'fcommerce-cash-on-delivery-address-accuracy',
      title: 'Mastering Cash-On-Delivery Order Verification to Cut Courier Returns',
      titleBn: 'ক্যাশ অন ডেলিভারিতে ভুল ঠিকানা ও ফেক অর্ডার কমানোর কার্যকর কৌশল',
      summary: 'How structured conversational data collection prevents courier return charges for Bangladeshi online shops.',
      summaryBn: 'অসম্পূর্ণ ঠিকানা ও ভুল ফোন নাম্বারের কারণে কুরিয়ার পার্সেল রিটার্ন আসার ক্ষতি এড়ানোর কৌশল।',
      image: '/src/assets/images/blog_fcommerce_sales_1792423840639.jpg',
      date: 'October 8, 2026',
      readTime: '5 min read',
      author: 'Tasnim Ahmed',
      authorRole: 'Operations Lead, BongoSell AI',
      category: 'Logistics & COD',
      contentBn: `F-Commerce বিজনেসের সবচেয়ে বড় আতঙ্ক হলো "পার্সেল রিটার্ন"। কুরিয়ার কোম্পানিগুলো ডেলিভারি না হলে দুইমুখী চার্জ কাটে। অনুসন্ধান করে দেখা গেছে, রিটার্নের প্রায় ৪৫% কারণ হলো কাস্টমারের অসাবধানতাবশত দেওয়া অসম্পূর্ণ ঠিকানা বা ১০ ডিজিটের ভুল ফোন নাম্বার।
      
এআই অর্ডার কালেকশনের সময় স্বয়ংক্রিয়ভাবে বাংলাদেশি ১১ ডিজিটের নম্বর ভেরিফাই করে এবং থানা/উপজেলা উল্লেখ না থাকলে বিনীতভাবে তা চেয়ে নেয়। পার্সেল বুকিংয়ের আগেই সম্পূর্ণ সামারি কাস্টমারকে দেখিয়ে নিশ্চিত করায় ডেলিভারি সাকসেস রেশিও উল্লেখযোগ্যভাবে বেড়ে যায়।`,
      contentEn: `Courier returns eat up seller profit margins. By automating the verification of 11-digit Bangladeshi mobile numbers and enforcing full police station / district address collection in Messenger, sellers can drastically reduce courier return penalties.`,
    },
    {
      id: 'blog-3',
      slug: 'balancing-ai-and-human-support-facebook-page',
      title: 'The Hybrid Formula: Balancing Automated AI With Human Touch',
      titleBn: 'হাইব্রিড ফর্মুলা: এআই অটোমেশনের সাথে হিউম্যান কাস্টমার কেয়ারের নিখুঁত ব্যালেন্স',
      summary: 'Why the smartest sellers do not replace their staff, but empower them with smart AI co-pilots.',
      summaryBn: 'এআই কখনোই মানুষের উষ্ণতার বিকল্প নয়; সাধারণ প্রশ্নের পুনরাবৃত্তি এআই সামলালে কর্মীরা স্পেশাল গ্রাহকদের যত্ন নিতে পারেন।',
      image: '/src/assets/images/fcommerce_store_showcase_1792423840871.jpg',
      date: 'September 28, 2026',
      readTime: '6 min read',
      author: 'Afsana Mimi',
      authorRole: 'Merchant Community Manager',
      category: 'Customer Experience',
      contentBn: `অনেক সেলার ভয় পান যে রোবট বা এআই ব্যবহার করলে গ্রাহকরা কৃত্রিম মনে করে চলে যাবে কিনা। বাস্তব সত্য হলো, গ্রাহক চায় দ্রুত ও সঠিক তথ্য। দাম কত, সাইজ আছে কি না, ডেলিভারি চার্জ কত—এই তিনটি প্রশ্ন ইনবক্সের ৭০% দখল করে। 
      
বংগোসেল এআই এই সাধারণ প্রশ্নগুলো নিখুঁতভাবে সামলায়। আর যখনই কোনো গ্রাহক কাস্টম ডিজাইন, বিশেষ ছাড়ের আবেদন কিংবা অভিযোগ নিয়ে আসে, তখন এআই নিজে চুপ হয়ে যায় এবং হিউম্যান অ্যাডমিনকে নোটিফাই করে। এই হাইব্রিড মডেলেই সেলস সর্বোচ্চ বাড়ানো সম্ভব।`,
      contentEn: `Automation should eliminate routine toil without stripping away the personal touch. With a seamless human handover switch, high-friction questions are handled by experienced shop managers while 70% of routine pricing queries are resolved instantly by AI.`,
    },
  ],
};
