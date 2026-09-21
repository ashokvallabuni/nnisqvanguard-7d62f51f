import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { labExecutionService } from "@/lib/lab-execution";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/cyber-range/lab/$slug")({
  component: LabPage,
});

function LabPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState("");

  const start = async () => {
    if (!user) return;
    const result = await labExecutionService.createSession(slug);
    setMessage(result.message);
  };

  return (
    <main className="pt-24 min-h-screen px-4 md:px-8">
      <div className="max-w-4xl mx-auto glass rounded-xl p-8">
        <p className="mono text-xs text-cyber">// LAB {slug.toUpperCase()}</p>
        <h1 className="display text-4xl mt-2">Live lab session</h1>
        <p className="text-muted-foreground mt-4">
          This lab will never claim to be running until the isolated execution service is connected.
        </p>
        <button
          onClick={() => void start()}
          className="mt-8 bg-primary text-primary-foreground rounded-md px-5 py-3 font-semibold"
        >
          START LAB
        </button>
        {message && (
          <p className="mt-6 border border-warning/40 rounded-md p-4 text-warning text-sm">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
