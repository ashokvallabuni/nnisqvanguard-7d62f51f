import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listPublishedLearningPaths } from "@/lib/cyber-labs";

export const Route = createFileRoute("/cyber-range/learning-paths")({
  component: LearningPathsPage,
});

function LearningPathsPage() {
  const [paths, setPaths] = useState<Awaited<ReturnType<typeof listPublishedLearningPaths>>>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    void listPublishedLearningPaths()
      .then(setPaths)
      .catch(() => setError(true));
  }, []);

  return (
    <main className="pt-24 min-h-screen px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <p className="mono text-xs text-cyber">// LEARNING PATHS</p>
        <h1 className="display text-5xl mt-2">Build capability by progression</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          NISQ learning paths combine reviewed modules and dataset-derived practice. Only published
          paths from the Supabase database appear here.
        </p>
        {error && (
          <p className="mono text-xs text-warning mt-8">LEARNING PATH DATA IS UNAVAILABLE.</p>
        )}
        {!error && paths.length === 0 && (
          <div className="glass rounded-lg p-8 mt-8">
            <p className="mono text-xs text-cyber">// NOT YET PUBLISHED</p>
            <h2 className="display text-2xl mt-2">Learning paths are being prepared</h2>
            <p className="text-sm text-muted-foreground mt-3">
              No production learning paths are available yet.
            </p>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-5 mt-8">
          {paths.map((path) => (
            <article key={path.id} className="glass rounded-lg p-6">
              <h2 className="display text-2xl">{path.name}</h2>
              <p className="text-sm text-muted-foreground mt-3">{path.description}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
