import { createFileRoute } from "@tanstack/react-router";

import { CyberIntelligenceHome } from "@/components/cyber-intelligence-home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NISQ Vanguard — Cyber Intelligence Platform" },
      {
        name: "description",
        content:
          "NISQ Vanguard cyber intelligence, practical defence, cyber education and guided labs for people, campuses and organisations.",
      },
      { property: "og:title", content: "NISQ Vanguard — Cyber Intelligence Platform" },
      {
        property: "og:description",
        content:
          "Practical cyber defence, education and intelligence for the threats of tomorrow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CyberIntelligenceHome,
});
