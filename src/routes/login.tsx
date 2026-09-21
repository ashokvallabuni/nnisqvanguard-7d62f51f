import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AuthPage } from "./auth";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ next: z.string().optional() }),
  head: () => ({ meta: [{ title: "Login — NISQ Vanguard" }] }),
  component: AuthPage,
});
