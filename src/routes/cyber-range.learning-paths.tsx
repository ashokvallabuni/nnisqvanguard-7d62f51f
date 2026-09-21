import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/cyber-range/learning-paths")({
  component: () => (
    <BackendPage
      eyebrow="LEARNING PATHS"
      title="Learning paths"
      description="Configured learning paths will be loaded from the Cyber Range database."
    />
  ),
});
