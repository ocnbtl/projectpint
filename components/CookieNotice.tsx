import Link from "next/link";

export function CookieNotice() {
  return (
    <div className="card small cookie-card">
      <p>
        We use analytics cookies to measure engagement and improve our product recommendations. By continuing to use this
        site, you consent to this measurement. See our <Link href="/legal/privacy">Privacy Policy</Link> for details.
      </p>
    </div>
  );
}
