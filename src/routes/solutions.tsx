import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/solutions")({
  component: () => (
    <BackendPage
      eyebrow="SOLUTIONS"
      title="Cybersecurity solutions"
      description="Practical security education and advisory services for organizations."
    />
  ),
});
