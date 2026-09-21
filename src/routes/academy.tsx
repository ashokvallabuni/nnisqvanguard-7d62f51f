import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/academy")({
  component: () => (
    <BackendPage
      eyebrow="ACADEMY"
      title="NISQ Academy"
      description="Browse configured courses, modules, quizzes and assignments from the academy database."
    />
  ),
});
