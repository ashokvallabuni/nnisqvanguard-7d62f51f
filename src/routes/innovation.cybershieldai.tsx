import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/innovation/cybershieldai")({
  component: () => (
    <BackendPage
      eyebrow="CYBERSHIELD AI"
      title="CyberShield AI"
      description="AI-assisted security workflows backed by the configured platform services."
    />
  ),
});
