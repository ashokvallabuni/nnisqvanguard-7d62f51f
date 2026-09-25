import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/cyber-range/challenges")({
  component: () => (
    <BackendPage
      eyebrow="CHALLENGES"
      title="Cyber challenges"
      description="Configured challenges will be loaded from the IVVAB LABS database."
    />
  ),
});
