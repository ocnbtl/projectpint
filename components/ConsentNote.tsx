import Link from "next/link";

export function ConsentNote() {
  return (
    <p className="small">
      By subscribing, you agree to receive emails from Diyesu Decor. You can unsubscribe anytime. See our{" "}
      <Link href="/legal/privacy">Privacy Policy</Link> for details.
    </p>
  );
}
