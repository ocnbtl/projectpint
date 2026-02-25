import Link from "next/link";
import { AdSlot } from "../components/AdSlot";
import { ConsentNote } from "../components/ConsentNote";
import { SiteShell } from "../components/SiteShell";

export default function HomePage() {
  return (
    <SiteShell>
      <section className="banner">
        <h1>Diyesu Decor: DIY Bathroom Upgrades</h1>
        <p>Faceless, practical systems that turn small bathrooms into calmer, better-functioning spaces.</p>
        <p>
          <Link href="/start-here" style={{ color: "#fef08a", fontWeight: 700 }}>
            Start Here
          </Link>
        </p>
      </section>

      <section className="grid grid-3" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Plant Picker (Free)</h3>
          <p>Get 2-3 bathroom plant matches based on your light, humidity, and space constraints.</p>
          <Link href="/lead-magnets/plant-picker">Get the free picker</Link>
        </div>
        <div className="card">
          <h3>Renter Blueprint (Paid)</h3>
          <p>Choose-your-path bathroom upgrade system by no-drill/drill, budget, and style direction.</p>
          <Link href="/products/renter-bathroom-upgrade-blueprint">See blueprint</Link>
        </div>
        <div className="card">
          <h3>Weekly DIY content</h3>
          <p>3 blog drafts and 25 pin concepts each week with quality and compliance checks.</p>
          <Link href="/blog">Browse the blog</Link>
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Email signup</h2>
        <form action="/api/subscribe" method="post">
          <label>
            Email
            <input name="email" type="email" required style={{ width: "100%", padding: 8, marginTop: 4 }} />
          </label>
          <input type="hidden" name="sourceUrl" value="/" />
          <input type="hidden" name="consentText" value="I agree to receive Diyesu Decor emails and understand I can unsubscribe anytime." />
          <button style={{ marginTop: 8 }}>Subscribe</button>
          <ConsentNote />
        </form>
      </section>

      <AdSlot enabled={true} slotId="home-top" />
    </SiteShell>
  );
}
