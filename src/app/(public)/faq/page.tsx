import type { Metadata } from "next";
import { Container, PageHero } from "@/components/site/chrome";
import { FaqList } from "@/components/site/faq-list";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about Nexora categories, videos, and enquiries.",
};

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero eyebrow="Help" title="Frequently asked questions" text="The short version of how the library, the footage, and the inbox work." />
      <Container className="py-12">
        <div className="mx-auto max-w-3xl">
          <FaqList items={faqs} />
        </div>
      </Container>
    </>
  );
}
