import { createFileRoute } from "@tanstack/react-router";
import { OrganizationDashboard } from "@/components/organization/OrganizationDashboard";

export const Route = createFileRoute("/_authenticated/organization/dashboard")({
  head: () => ({
    meta: [
      { title: "Organization Dashboard — NISQ Vanguard" },
      {
        name: "description",
        content: "Manage incident reports, consulting appointments, and enterprise services.",
      },
    ],
  }),
  component: OrganizationDashboard,
});
