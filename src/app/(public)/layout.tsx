import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { getSettings } from "@/lib/queries";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <Header siteName={settings.siteName} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
