import { AdminFrame } from "../../../components/admin/AdminFrame";
import Link from "next/link";
import { AdminGenerateDisclosure } from "../../../components/admin/AdminGenerateDisclosure";
import { AdminSheetWorkspace } from "../../../components/admin/AdminSheetWorkspace";
import { AreaCountsAction } from "../../../components/admin/AreaCountsAction";
import { OpsButton } from "../../../components/admin/OpsButton";
import { ADMIN_TABLE_COLUMNS } from "../../../lib/admin-table-view";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const rows = await loadEvergreenTab("blogs");

  return (
    <AdminFrame>
      <AdminSheetWorkspace
        tab="blogs"
        heroTitle="Blogs"
        heroDescription={
          <p>Manage evergreen blog articles across all content areas.</p>
        }
        editorTitle="Blogs Evergreen"
        columns={[...ADMIN_TABLE_COLUMNS.blogs]}
        initialRows={rows}
        dateColumn="Blog_Publish_Date"
      >
        <div className="admin-action-stack admin-figma-action-stack">
          <div className="admin-ops-grid">
            <Link href="/admin/blogs/new" className="btn btn-accent">New blog</Link>
            <AdminGenerateDisclosure label="Generate New Blogs">
              <AreaCountsAction action="generate_new_blogs" label="Generate new blogs" mode="checkbox" />
            </AdminGenerateDisclosure>
            <OpsButton action="generate_blog_titles_keywords" label="Refresh Prompts" icon="refresh" variant="ghost" />
            <OpsButton action="refresh_blog_quality_checks" label="Refresh QC" icon="refresh" variant="ghost" />
            <OpsButton action="update_blog_related_pins" label="Update Related Pins" icon="link" variant="ghost" />
            <OpsButton action="publish_approved_blogs" label="Publish Approved" icon="play" />
          </div>
        </div>
      </AdminSheetWorkspace>
    </AdminFrame>
  );
}
