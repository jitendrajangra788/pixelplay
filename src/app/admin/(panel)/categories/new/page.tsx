import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/forms";
import { AdminHeader } from "@/components/admin/shell";

export const metadata: Metadata = { title: "New category" };

export default function NewCategoryPage() {
  return (
    <>
      <AdminHeader title="New category" description="The cover image is shown on category cards. Inactive categories stay off the public site." />
      <CategoryForm />
    </>
  );
}
