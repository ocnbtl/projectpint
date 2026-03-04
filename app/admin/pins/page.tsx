import { AdminFrame } from "../../../components/admin/AdminFrame";
import { DataSheetEditor } from "../../../components/admin/DataSheetEditor";
import { OpsButton } from "../../../components/admin/OpsButton";
import { COMMAND_CENTER_COLUMNS } from "../../../lib/command-center-config";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default function AdminPinsPage() {
  const rows = loadEvergreenTab("pins");

  return (
    <AdminFrame>
      <section className="admin-panel">
        <h1>Pins</h1>
        <p>
          Generate new evergreen pin rows first, then generate overlay and CTA copy. Media URL and live Pin URL stay
          manual.
        </p>
        <div className="admin-actions-inline">
          <OpsButton action="generate_new_pins" label="Generate new pins" payload={{ count: 25 }} />
          <OpsButton action="generate_overlay_cta" label="Generate overlay and CTA" payload={{ count: 25 }} />
        </div>
      </section>

      <DataSheetEditor
        tab="pins"
        title="Pins Evergreen"
        columns={[...COMMAND_CENTER_COLUMNS.pins]}
        initialRows={rows}
        dateColumn="Pin_Publish_Date"
      />
    </AdminFrame>
  );
}
