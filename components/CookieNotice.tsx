import Link from "next/link";

export function CookieNotice() {
  return (
    <div className="card small cookie-card">
      <p>
        We use analytics cookies to measure outbound clicks, signups, and product CTA engagement. By continuing to use
        this site, you consent to this measurement. See the <Link href="/legal/privacy">Privacy Policy</Link> for
        details.
      </p>
    </div>
  );
}
