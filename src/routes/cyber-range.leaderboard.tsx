import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/cyber-range/leaderboard")({
  component: () => (
    <BackendPage
      eyebrow="LEADERBOARD"
      title="Leaderboard"
      description="Personalized leaderboard data is available only for authenticated users and configured records."
    />
  ),
});
