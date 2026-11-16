import type { Metadata } from "next";
import { WebsiteForm } from "@/components/admin/forms";
import { AdminHeader } from "@/components/admin/shell";
import { getSettings } from "@/lib/queries";
import type { SearchProps } from "@/lib/page-types";
import { firstParam } from "@/lib/utils";

export const metadata: Metadata = { title: "Website settings" };

export default async function SettingsPage({ searchParams }: SearchProps) {
  const [settings, params] = await Promise.all([getSettings(), searchParams]);
  return (
    <>
      <AdminHeader title="Website settings" description="The public name, hero, about section, contact details, and social links." />
      <WebsiteForm settings={settings} saved={firstParam(params.saved) === "1"} />
    </>
  );
}
