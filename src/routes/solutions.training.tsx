import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/solutions/training")({
  component: () => (
    <BackendPage
      eyebrow="TRAINING"
      title="Security training"
      description="Structured learning programs for teams, campuses and security practitioners."
    />
  ),
});
