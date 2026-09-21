import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/certificates")({
  component: CertificatesPage,
});
function CertificatesPage() {
  return (
    <main className="pt-24 min-h-screen px-4">
      <div className="max-w-4xl mx-auto glass rounded-xl p-8">
        <p className="mono text-xs text-cyber">// CERTIFICATES</p>
        <h1 className="display text-4xl mt-2">My certificates</h1>
        <p className="text-muted-foreground mt-4">
          Certificates issued to your authenticated account will appear here.
        </p>
      </div>
    </main>
  );
}
