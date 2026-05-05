"use client";

import { useTranslations } from "next-intl";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const TESTIMONIALS_EN = [
  {
    quote:
      "BP Holding delivered our 24-storey residential tower on time and on budget. Their structural team's attention to detail was exceptional.",
    name: "Khalid Al-Rashid",
    title: "Project Director, Al-Rashid Real Estate",
  },
  {
    quote:
      "From design through commissioning, the engineering consulting was world-class. They navigated Saudi Building Code compliance flawlessly.",
    name: "Nawal Al-Sabban",
    title: "VP Development, Riyadh Capital",
  },
  {
    quote:
      "The interior finishing on our HQ exceeded expectations. Premium materials, meticulous craftsmanship, delivered on schedule.",
    name: "Faisal Al-Otaibi",
    title: "CEO, Al-Otaibi Holdings",
  },
  {
    quote:
      "Transparent communication, proactive risk management, zero surprises. That's why we hired BP for the next phase.",
    name: "Hessa Al-Mutairi",
    title: "Head of Construction, Mutairi Group",
  },
  {
    quote:
      "Their general contracting team unified five subcontractors into one disciplined delivery. Single point of accountability worked.",
    name: "Abdullah Al-Qahtani",
    title: "Owner Representative, Qahtani Industries",
  },
];

// TODO: replace with verified Arabic translations from real client quotes.
const TESTIMONIALS_AR = [
  {
    quote:
      "سلّمت بزنس بايونيرز برجنا السكني المكوّن من 24 طابقاً في الموعد وضمن الميزانية. اهتمام فريقهم الإنشائي بالتفاصيل كان استثنائياً.",
    name: "خالد الراشد",
    title: "مدير المشاريع، الراشد العقارية",
  },
  {
    quote:
      "من التصميم إلى التشغيل، كانت الاستشارات الهندسية على مستوى عالمي. تعاملوا مع متطلبات كود البناء السعودي بسلاسة تامة.",
    name: "نوال السبان",
    title: "نائب رئيس التطوير، الرياض كابيتال",
  },
  {
    quote:
      "تشطيبات مقرنا الرئيسي فاقت التوقعات. مواد فاخرة وحرفية دقيقة، وتم التسليم في الموعد.",
    name: "فيصل العتيبي",
    title: "الرئيس التنفيذي، العتيبي القابضة",
  },
  {
    quote:
      "تواصل شفّاف وإدارة استباقية للمخاطر دون أي مفاجآت. لهذا تعاقدنا معهم على المرحلة القادمة.",
    name: "حصة المطيري",
    title: "رئيس قسم الإنشاءات، مجموعة المطيري",
  },
  {
    quote:
      "وحّد فريق المقاولات العامة لديهم خمسة مقاولين فرعيين في تسليم منضبط. نقطة المساءلة الواحدة كانت فعّالة.",
    name: "عبدالله القحطاني",
    title: "ممثل المالك، القحطاني الصناعية",
  },
];

export function Testimonials({ locale }: { locale: "ar" | "en" }) {
  const t = useTranslations("home.testimonials");
  const items = locale === "ar" ? TESTIMONIALS_AR : TESTIMONIALS_EN;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <p className="text-xs font-mono uppercase tracking-[0.24em] text-brand-gold">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("title")}
        </h2>
      </header>
      <InfiniteMovingCards items={items} speed="normal" />
    </section>
  );
}
