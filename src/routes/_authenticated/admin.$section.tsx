import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/_authenticated/admin/$section")({
  component: AdminSectionPage,
});
function AdminSectionPage() {
  const { section } = Route.useParams();
  return (
    <BackendPage
      eyebrow={`ADMIN / ${section.toUpperCase()}`}
      title="Administration"
      description="This administrative surface reads and writes Supabase records only after database authorization succeeds."
    />
  );
}
