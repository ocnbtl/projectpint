import { redirect } from "next/navigation";
import { AdminLoginForm } from "../../../components/admin/AdminLoginForm";
import { isAdminSessionValid } from "../../../lib/admin-auth";

export const dynamic = "force-dynamic";

interface AdminLoginPageProps {
  searchParams: Promise<{ error?: string; logged_out?: string }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  if (await isAdminSessionValid()) {
    redirect("/admin");
  }

  const params = await searchParams;
  const errorMessage =
    params.error === "rate_limit"
      ? "Too many attempts. Wait a few minutes and try again."
      : params.error === "config"
        ? "Admin access is unavailable until the environment session settings are completed."
      : params.error === "1"
        ? "Access was not granted. Check the code and try again."
        : "";
  const noticeMessage = params.logged_out === "1" ? "Session closed." : "";

  return (
    <main className="admin-login-shell">
      <section className="admin-login-stage" aria-label="Admin sign in">
        <AdminLoginForm errorMessage={errorMessage} noticeMessage={noticeMessage} />
      </section>
    </main>
  );
}
