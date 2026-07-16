import { AdminFrame } from "../../../components/admin/AdminFrame";
import Link from "next/link";
import { AdminGenerateDisclosure } from "../../../components/admin/AdminGenerateDisclosure";
import { AdminSheetWorkspace } from "../../../components/admin/AdminSheetWorkspace";
import { AreaCountsAction } from "../../../components/admin/AreaCountsAction";
import { OpsButton } from "../../../components/admin/OpsButton";
import { ADMIN_TABLE_COLUMNS } from "../../../lib/admin-table-view";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default async function AdminGuidesPage() {
  const rows = await loadEvergreenTab("guides");

  return (
    <AdminFrame>
      <AdminSheetWorkspace
        tab="guides"
        heroTitle="Guides"
        heroDescription={
          <p>Manage quick companion guides for every bathroom upgrade area.</p>
        }
        editorTitle="Guides Evergreen"
        columns={[...ADMIN_TABLE_COLUMNS.guides]}
        initialRows={rows}
        dateColumn="Guide_Publish_Date"
      >
        <div className="admin-action-stack admin-figma-action-stack">
          <div className="admin-ops-grid">
            <Link href="/admin/guides/new" className="btn btn-accent">New guide</Link>
            <AdminGenerateDisclosure label="Generate New Guides">
              <AreaCountsAction action="generate_new_guides" label="Generate new guides" mode="checkbox" />
            </AdminGenerateDisclosure>
            <OpsButton action="generate_guide_titles_keywords" label="Refresh Prompts" icon="refresh" variant="ghost" />
            <OpsButton action="refresh_guide_quality_checks" label="Refresh QC" icon="refresh" variant="ghost" />
            <OpsButton action="update_guide_related_pins" label="Update Related Pins" icon="link" variant="ghost" />
            <OpsButton action="publish_approved_guides" label="Publish Approved" icon="play" />
          </div>
        </div>
      </AdminSheetWorkspace>
    </AdminFrame>
  );
}
