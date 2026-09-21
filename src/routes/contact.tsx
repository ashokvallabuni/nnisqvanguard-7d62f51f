import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";
export const Route = createFileRoute("/contact")({
  component: () => (
    <BackendPage
      eyebrow="CONTACT"
      title="Contact NISQ Vanguard"
      description="Consultation submissions are stored only after a real Supabase operation succeeds."
    />
  ),
});
