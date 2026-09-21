import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/terms")({
  component: () => (
    <BackendPage
      eyebrow="TERMS"
      title="Terms of service"
      description="Review the terms governing use of NISQ Vanguard."
    />
  ),
});
