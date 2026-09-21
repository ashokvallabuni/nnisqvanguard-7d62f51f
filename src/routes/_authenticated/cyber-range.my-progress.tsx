import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/_authenticated/cyber-range/my-progress")({
  component: () => (
    <BackendPage
      eyebrow="MY PROGRESS"
      title="My Cyber Range progress"
      description="Your progress is read from authenticated lab_progress and lab_attempts records."
    />
  ),
});
