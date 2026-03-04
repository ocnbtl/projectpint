import Link from "next/link";

export const dynamic = "force-dynamic";

interface AdminLoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const hasError = params.error === "1";

  return (
    <main className="container" style={{ paddingTop: 24, paddingBottom: 32 }}>
      <section className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
        <p className="eyebrow" style={{ color: "var(--brand-deep)" }}>
          Admin
        </p>
        <h1>Command Center Login</h1>
        <p>Enter your admin access code to open the Diyesu Decor command center.</p>
        {hasError ? <p className="notice-error">Login failed. Check the password and try again.</p> : null}
        <form action="/api/admin/login" method="post" className="form-grid">
          <div className="field">
            <label htmlFor="admin-password">Access code</label>
            <input id="admin-password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-accent">
            Log in
          </button>
        </form>
        <p className="small" style={{ marginTop: 10 }}>
          Access code source: <code>ADMIN_PASSWORD</code> in <code>.env.local</code>. Change the value there to rotate
          your password.
        </p>
        <p className="small" style={{ marginBottom: 0 }}>
          <Link href="/">Back to public site</Link>
        </p>
      </section>
    </main>
  );
}
