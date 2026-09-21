import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/campus")({
  component: () => (
    <BackendPage
      eyebrow="CAMPUS"
      title="Campus programs"
      description="Campus consultation workflows are connected to the Supabase backend and will show configured programs here."
    />
  ),
});
