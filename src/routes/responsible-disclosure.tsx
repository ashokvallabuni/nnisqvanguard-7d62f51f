import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/responsible-disclosure")({
  component: () => (
    <BackendPage
      eyebrow="DISCLOSURE"
      title="Responsible disclosure"
      description="Please use the configured security reporting channel for vulnerability reports."
    />
  ),
});
