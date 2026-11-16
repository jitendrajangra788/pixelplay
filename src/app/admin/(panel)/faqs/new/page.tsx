import type { Metadata } from "next";
import { FaqForm } from "@/components/admin/forms";
import { AdminHeader } from "@/components/admin/shell";

export const metadata: Metadata = { title: "New question" };

export default function NewFaqPage() {
  return (
    <>
      <AdminHeader title="New question" description="Lower numbers appear first in the accordion." />
      <FaqForm />
    </>
  );
}
