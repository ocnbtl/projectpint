import { AdminFrame } from "../../../components/admin/AdminFrame";
import { AdminSheetWorkspace } from "../../../components/admin/AdminSheetWorkspace";
import { AreaCountsAction } from "../../../components/admin/AreaCountsAction";
import { OpsButton } from "../../../components/admin/OpsButton";
import { countRowsMatching, countRowsWith, uniqueValueCount } from "../../../lib/admin-table-stats";
import { COMMAND_CENTER_COLUMNS } from "../../../lib/command-center-config";
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
          <p>
            Generate short companion guides by area, add the exact guide topic to <code>Guide_Title</code>, add
            keywords manually if you want them, and let <code>Writer_Brief</code> refresh around that title. Paste the
            final draft into <code>Guide_Content</code>, run QC, then approve and publish to the live{" "}
            <code>/guides/*</code> route.
          </p>
        }
        editorTitle="Guides Evergreen"
        columns={[...COMMAND_CENTER_COLUMNS.guides]}
        initialRows={rows}
        dateColumn="Guide_Publish_Date"
        summaryCards={[
          { label: "Guides", value: rows.length.toLocaleString(), detail: "companion guide rows", tone: "green" },
          { label: "Approved", value: countRowsMatching(rows, "Workflow_Status", "approved").toLocaleString(), detail: "ready to publish", tone: "gold" },
          { label: "Published", value: countRowsWith(rows, "Published_To_Public_At").toLocaleString(), detail: "live public rows", tone: "blue" },
          { label: "Areas", value: uniqueValueCount(rows, "Content_Area").toLocaleString(), detail: "content coverage", tone: "brown" }
        ]}
      >
        <div className="admin-action-stack admin-hero-stack">
          <AreaCountsAction action="generate_new_guides" label="Generate new guides" mode="checkbox" />
          <div className="admin-ops-grid">
            <OpsButton action="generate_guide_titles_keywords" label="Refresh guide prompts" />
            <OpsButton action="refresh_guide_quality_checks" label="Refresh guide QC" variant="ghost" />
            <OpsButton action="update_guide_related_pins" label="Update related pins" variant="ghost" />
            <OpsButton action="publish_approved_guides" label="Publish approved guides" />
          </div>
        </div>
      </AdminSheetWorkspace>
    </AdminFrame>
  );
}
