import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import type { SearchProps } from "@/lib/page-types";
import { firstParam } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin sign in" };

export default async function LoginPage({ searchParams }: SearchProps) {
  const params = await searchParams;
  return (
    <div className="flex flex-1 items-center justify-center bg-navy-950 px-5 py-16">
      <LoginForm nextPath={firstParam(params.next) || "/admin"} />
    </div>
  );
}
