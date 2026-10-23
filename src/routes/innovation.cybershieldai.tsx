import { createFileRoute } from "@tanstack/react-router";
import { BackendPage } from "@/components/backend-page";

export const Route = createFileRoute("/innovation/cybershieldai")({
  head: () => ({
    meta: [
      { title: "IVVAB AI & Threat Defense — NISQ Vanguard" },
      { name: "description", content: "AI-assisted cybersecurity defense workflows and analysis." },
    ],
  }),
  component: () => (
    <BackendPage
      eyebrow="NISQ AI DEFENSE"
      title="IVVAB AI & Threat Defense"
      description="AI-assisted security workflows backed by NISQ Vanguard platform services."
    />
  ),
});
