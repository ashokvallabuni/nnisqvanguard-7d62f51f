import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { labExecutionService } from "@/lib/lab-execution";
import { useAuth } from "@/lib/auth-context";
import { getConnectedDataset, getPublishedLabBySlug } from "@/lib/cyber-labs";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/cyber-range/lab/$slug")({
  component: LabPage,
});

function LabPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [lab, setLab] = useState<Database["public"]["Tables"]["labs"]["Row"] | null>(null);
  const [dataset, setDataset] = useState<Database["public"]["Tables"]["datasets"]["Row"] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [command, setCommand] = useState("");
  const [terminalOutput, setTerminalOutput] = useState("");
  const [terminalBusy, setTerminalBusy] = useState(false);

  useEffect(() => {
    void getPublishedLabBySlug(slug)
      .then(async (result) => {
        setLab(result);
        if (!result) {
          setNotFound(true);
          return;
        }
        if (result.dataset_id) setDataset(await getConnectedDataset(result.dataset_id));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const start = async () => {
    if (!user) return;
    const result = await labExecutionService.createSession(slug);
    setSessionId(result.id);
    setMessage(result.message);
  };

  const execute = async () => {
    if (!sessionId || !command.trim()) return;
    setTerminalBusy(true);
    const result = await labExecutionService.executeTerminal(slug, sessionId, command);
    setTerminalOutput((current) => `${current}$ ${command}\n${result.stdout ?? result.message}\n`);
    setCommand("");
    setTerminalBusy(false);
  };

  return (
    <main className="pt-24 min-h-screen px-4 md:px-8">
      <div className="max-w-4xl mx-auto glass rounded-xl p-8">
        {loading && <p className="mono text-xs text-muted-foreground">LOADING LAB...</p>}
        {!loading && (notFound || !lab) && (
          <>
            <p className="mono text-xs text-warning">// LAB NOT FOUND</p>
            <h1 className="display text-4xl mt-2">This lab is not published</h1>
            <Link to="/cyber-range/labs" className="inline-block mt-6 text-cyber underline">
              Back to labs
            </Link>
          </>
        )}
        {!loading && lab && !notFound && (
          <>
            <p className="mono text-xs text-cyber">
              // {lab.difficulty} · {lab.lab_type}
            </p>
            <h1 className="display text-4xl mt-2">{lab.title}</h1>
            <p className="text-muted-foreground mt-4">{lab.description}</p>
            <div className="grid sm:grid-cols-3 gap-4 mt-8 text-sm">
              <Info label="Estimated time" value={`${lab.estimated_time_minutes} min`} />
              <Info label="Points" value={String(lab.points)} />
              <Info label="Dataset" value={dataset?.name ?? "NOT CONNECTED"} />
            </div>
            <LabList label="Learning objectives" values={lab.learning_objectives} />
            <LabList label="Prerequisites" values={lab.prerequisites} />
            <button
              onClick={() => void start()}
              disabled={Boolean(sessionId)}
              className="mt-8 bg-primary text-primary-foreground rounded-md px-5 py-3 font-semibold"
            >
              {sessionId ? "LAB SESSION ACTIVE" : "START LAB"}
            </button>
            {sessionId && (
              <section className="mt-8 border border-border/70 rounded-md p-4">
                <p className="mono text-xs text-emerald-600">CONNECTED TO ISOLATED LAB</p>
                <pre className="mt-4 min-h-40 overflow-auto rounded bg-black/90 p-4 text-xs text-white">
                  {terminalOutput || "Session ready. Run a command inside the isolated lab."}
                </pre>
                <div className="mt-4 flex gap-2">
                  <input
                    value={command}
                    onChange={(event) => setCommand(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void execute();
                    }}
                    placeholder="ls -la /opt/nisq-lab"
                    className="min-w-0 flex-1 rounded border border-border bg-background px-3 py-2 mono text-sm"
                    disabled={terminalBusy}
                  />
                  <button
                    onClick={() => void execute()}
                    disabled={terminalBusy || !command.trim()}
                    className="rounded bg-primary px-4 py-2 text-primary-foreground"
                  >
                    {terminalBusy ? "RUNNING..." : "RUN"}
                  </button>
                </div>
              </section>
            )}
            {message && (
              <p className="mt-6 border border-warning/40 rounded-md p-4 text-warning text-sm">
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border/70 rounded-md p-3">
      <p className="mono text-[0.6rem] text-muted-foreground">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
}

function LabList({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="display text-xl">{label}</h2>
      <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-1">
        {values.map((value) => (
          <li key={value}>{value}</li>
        ))}
      </ul>
    </section>
  );
}
