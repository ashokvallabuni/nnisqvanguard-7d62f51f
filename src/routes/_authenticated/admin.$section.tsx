import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BackendPage } from "@/components/backend-page";
import { listDatasetsForAdmin } from "@/lib/cyber-labs";

export const Route = createFileRoute("/_authenticated/admin/$section")({
  component: AdminSectionPage,
});

function AdminSectionPage() {
  const { section } = Route.useParams();
  if (section === "datasets") return <AdminDatasetsPage />;
  return (
    <BackendPage
      eyebrow={`ADMIN / ${section.toUpperCase()}`}
      title="Administration"
      description="This administrative surface reads and writes Supabase records only after database authorization succeeds."
    />
  );
}

function AdminDatasetsPage() {
  const [datasets, setDatasets] = useState<Awaited<ReturnType<typeof listDatasetsForAdmin>>>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    void listDatasetsForAdmin()
      .then(setDatasets)
      .catch(() => setError(true));
  }, []);

  return (
    <main className="pt-24 min-h-screen px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <p className="mono text-xs text-cyber">// ADMIN / DATASETS</p>
        <h1 className="display text-5xl mt-2">Dataset management</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Dataset records are shown from Supabase. Importing and publishing remain explicit
          administrative workflows; no dataset is marked connected without ingestion.
        </p>
        {error && <p className="mono text-xs text-warning mt-8">DATASET DATA IS UNAVAILABLE.</p>}
        {!error && datasets.length === 0 && (
          <div className="glass rounded-lg p-8 mt-8">
            <p className="mono text-xs text-cyber">// NO DATASETS</p>
            <h2 className="display text-2xl mt-2">No dataset has been connected</h2>
            <p className="text-sm text-muted-foreground mt-3">
              Add a licensed source through the ingestion workflow before creating dataset-derived
              labs.
            </p>
          </div>
        )}
        {datasets.length > 0 && (
          <div className="overflow-x-auto glass rounded-lg mt-8">
            <table className="w-full text-sm">
              <thead className="border-b border-border/70 text-left">
                <tr>
                  {["Dataset", "Source", "Version", "License", "Records", "Status"].map((label) => (
                    <th key={label} className="p-4 mono text-[0.65rem] text-muted-foreground">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datasets.map((dataset) => (
                  <tr key={dataset.id} className="border-b border-border/50 last:border-0">
                    <td className="p-4 font-medium">{dataset.name}</td>
                    <td className="p-4">{dataset.source}</td>
                    <td className="p-4">{dataset.version}</td>
                    <td className="p-4">{dataset.license}</td>
                    <td className="p-4">{dataset.record_count.toLocaleString()}</td>
                    <td className="p-4 mono text-[0.65rem] text-cyber">{dataset.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
