import Link from "next/link";
import { AdminFrame } from "./AdminFrame";

export function AdminNotFoundState() {
  return (
    <AdminFrame>
      <section className="admin-state-panel">
        <div>
          <p className="eyebrow">Not found</p>
          <h1>That admin item is not available.</h1>
          <p>It may have been removed or its identifier may have changed.</p>
        </div>
        <Link href="/admin" className="btn btn-accent">Return to dashboard</Link>
      </section>
    </AdminFrame>
  );
}
