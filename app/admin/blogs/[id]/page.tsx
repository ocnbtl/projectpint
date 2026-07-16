import { notFound } from "next/navigation";
import { AdminFrame } from "../../../../components/admin/AdminFrame";
import { EditorialEditor } from "../../../../components/admin/EditorialEditor";
import { loadEditorialEditorModel } from "../../../../lib/editorial-admin";

export const dynamic = "force-dynamic";

export default async function AdminBlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const model = await loadEditorialEditorModel("blogs", id);
  if (!model) notFound();

  return <AdminFrame><EditorialEditor initialModel={model} /></AdminFrame>;
}
