import { AdminShell } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const unread = await prisma.enquiry.count({ where: { read: false } });
  return (
    <AdminShell name={admin.name} email={admin.email} unread={unread}>
      {children}
    </AdminShell>
  );
}
