import type { Metadata } from "next";
import { Container, PageHero } from "@/components/site/chrome";
import { ContactForm } from "@/components/site/contact-form";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a note to the Nexora studio.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHero eyebrow="Inbox" title="Contact us" text="Share a game, a roster, or a question. The message is saved for the studio to read." />
      <Container className="grid gap-8 py-12 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="h-fit rounded-3xl border border-white/10 bg-navy-900 p-6">
          <h2 className="font-display text-2xl text-white">Studio</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-muted">Email</dt>
              <dd>
                <a className="text-white hover:text-accent-soft" href={`mailto:${settings.contactEmail}`}>
                  {settings.contactEmail}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted">Phone</dt>
              <dd>
                <a className="text-white hover:text-accent-soft" href={`tel:${settings.contactPhone}`}>
                  {settings.contactPhone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted">Address</dt>
              <dd className="text-white">{settings.contactAddress}</dd>
            </div>
          </dl>
        </aside>
        <ContactForm />
      </Container>
    </>
  );
}
