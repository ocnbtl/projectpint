import Link from "next/link";

export function ConsentNote() {
  return (
    <p className="small">
      By subscribing, you agree to receive Diyesu Decor emails. You can unsubscribe anytime. See our{" "}
      <Link href="/legal/privacy">Privacy Policy</Link> for details.
    </p>
  );
}
