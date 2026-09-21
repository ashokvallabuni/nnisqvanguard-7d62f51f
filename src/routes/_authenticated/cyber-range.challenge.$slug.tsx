import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/_authenticated/cyber-range/challenge/$slug")({
  component: ChallengePage,
});
function ChallengePage() {
  const { slug } = Route.useParams();
  return (
    <BackendPage
      eyebrow={`CHALLENGE ${slug.toUpperCase()}`}
      title="Challenge session"
      description="Challenge execution is not enabled until the isolated Cyber Range service is connected."
    />
  );
}
