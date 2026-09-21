import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";

export const Route = createFileRoute("/_authenticated/cyber-range/ctf")({
  component: () => (
    <BackendPage
      eyebrow="CTF"
      title="Capture the Flag"
      description="Active CTF challenges and flags submitted by your user account will appear here."
    />
  ),
});
