import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/events")({
  component: () => (
    <BackendPage
      eyebrow="EVENTS"
      title="Events"
      description="Configured events and registrations will appear here."
    />
  ),
});
