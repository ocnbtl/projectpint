import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";

export default function StartHerePage() {
  return (
    <SiteShell>
      <div className="card">
        <h1>Start Here</h1>
        <p>Choose your path based on your constraints:</p>
        <ol>
          <li>No-drill renter-safe upgrades under $75.</li>
          <li>Storage-first plan for tiny bathrooms.</li>
          <li>Style-first plan for maximalist-on-budget looks.</li>
          <li>Plant-friendly path for low-light bathrooms.</li>
        </ol>
        <p>
          Next step: <Link href="/lead-magnets/plant-picker">free Plant Picker</Link> or{" "}
          <Link href="/products/renter-bathroom-upgrade-blueprint">Renter Blueprint</Link>.
        </p>
      </div>
    </SiteShell>
  );
}
