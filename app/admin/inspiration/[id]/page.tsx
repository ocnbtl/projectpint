import { notFound } from "next/navigation";
import { AdminFrame } from "../../../../components/admin/AdminFrame";
import { EditorialEditor } from "../../../../components/admin/EditorialEditor";
import { loadInspirationEditorModel } from "../../../../lib/inspiration-admin";

export const dynamic = "force-dynamic";

export default async function AdminInspirationEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const model = await loadInspirationEditorModel(id);
  if (!model) notFound();
  return <AdminFrame><EditorialEditor initialModel={model} /></AdminFrame>;
}
