import Link from "next/link";
import { redirect } from "next/navigation";
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
      : params.error === "1"
        ? "Access was not granted. Check the code and try again."
        : "";
  const noticeMessage = params.logged_out === "1" ? "Session closed." : "";

  return (
    <main className="admin-login-shell">
      <section className="admin-login-stage container">
        <div className="admin-login-panel">
          <div className="admin-login-header">
            <Link href="/" className="brand admin-login-brand">
              <span className="brand-mark" aria-hidden="true" />
              <span>
                <span className="brand-name">Diyesu Decor</span>
                <span className="brand-tagline">DIY Bathroom Upgrades</span>
              </span>
            </Link>
            <p className="eyebrow admin-login-eyebrow">Private Access</p>
            <h1>Authorized operators only</h1>
            <p>
              This workspace is reserved for internal publishing and review. If you are looking for bathroom DIY ideas,
              return to the main site.
            </p>
          </div>

          {errorMessage ? <p className="notice-error">{errorMessage}</p> : null}
          {noticeMessage ? <p className="notice-success">{noticeMessage}</p> : null}

          <form action="/api/admin/login" method="post" className="admin-login-form">
            <div className="field admin-login-field">
              <label htmlFor="admin-password">Access code</label>
              <input id="admin-password" name="password" type="password" required autoComplete="current-password" />
            </div>
            <button type="submit" className="btn btn-accent admin-login-submit">
              Continue
            </button>
          </form>

          <div className="admin-login-foot">
            <p className="small">Session access expires automatically and is limited to approved operators.</p>
            <Link href="/" className="btn btn-ghost">
              Return to site
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
