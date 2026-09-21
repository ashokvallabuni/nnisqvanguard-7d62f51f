import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/security")({
  component: () => (
    <BackendPage
      eyebrow="SECURITY"
      title="Security"
      description="Security controls and responsible platform practices."
    />
  ),
});
