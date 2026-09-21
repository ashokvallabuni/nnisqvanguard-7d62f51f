import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/verify/$certificateId")({ component: VerifyCertificatePage });
function VerifyCertificatePage() {
  const { certificateId } = Route.useParams();
  return <main className="pt-24 min-h-screen px-4"><div className="max-w-2xl mx-auto glass rounded-xl p-8"><p className="mono text-xs text-cyber">// PUBLIC VERIFICATION</p><h1 className="display text-4xl mt-2">Certificate verification</h1><p className="text-muted-foreground mt-4">Certificate ID: {certificateId}</p><p className="mt-6 text-sm">Verification data will be shown only when this certificate exists in the configured database.</p></div></main>;
}
