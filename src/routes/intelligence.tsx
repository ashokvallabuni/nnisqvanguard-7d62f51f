import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/intelligence")({
  component: () => (
    <BackendPage
      eyebrow="INTELLIGENCE"
      title="Security intelligence"
      description="Threat intelligence content will appear when configured in Supabase."
    />
  ),
});
