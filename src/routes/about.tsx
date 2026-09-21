import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/about")({
  component: () => (
    <BackendPage
      eyebrow="ABOUT"
      title="About NISQ Vanguard"
      description="Security learning and cyber readiness for the next generation."
    />
  ),
});
