import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/case-studies")({
  component: () => (
    <BackendPage
      eyebrow="CASE STUDIES"
      title="Case studies"
      description="Published case studies will appear from the content database."
    />
  ),
});
