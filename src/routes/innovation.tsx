import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/innovation")({
  component: () => (
    <BackendPage
      eyebrow="INNOVATION"
      title="Security innovation"
      description="Explore configured NISQ Vanguard innovation initiatives."
    />
  ),
});
