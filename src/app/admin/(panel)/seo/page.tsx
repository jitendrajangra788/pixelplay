import type { Metadata } from "next";
import { SeoForm } from "@/components/admin/forms";
import { AdminHeader } from "@/components/admin/shell";
import { getSettings } from "@/lib/queries";
import type { SearchProps } from "@/lib/page-types";
import { firstParam } from "@/lib/utils";

export const metadata: Metadata = { title: "SEO settings" };

export default async function SeoPage({ searchParams }: SearchProps) {
  const [settings, params] = await Promise.all([getSettings(), searchParams]);
  return (
    <>
      <AdminHeader title="SEO settings" description="The default title, description, and keywords used when a page does not set its own." />
      <SeoForm settings={settings} saved={firstParam(params.saved) === "1"} />
    </>
  );
}
