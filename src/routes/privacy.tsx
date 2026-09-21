import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/privacy")({
  component: () => (
    <BackendPage
      eyebrow="PRIVACY"
      title="Privacy policy"
      description="Review the privacy terms configured for this platform."
    />
  ),
});
