import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/_authenticated/certificates")({
  component: CertificatesPage,
});
function CertificatesPage() {
  return (
    <main className="min-h-screen">
      <PageHeader
        badge="VERIFIED CREDENTIALS"
        badgeVariant="success"
        title="My Certificates"
        subtitle="Official NISQ Vanguard certificates awarded for completed programs and lab missions."
        breadcrumbs={[{ label: "WORKSPACE", to: "/dashboard" }, { label: "CERTIFICATES" }]}
      />
      <div className="px-4 md:px-8 py-8 max-w-5xl mx-auto">
        <div className="glass rounded-xl p-6 md:p-8 border border-border">
          <p className="mono text-xs text-cyber">// CERTIFICATE VAULT</p>
          <h2 className="display text-2xl md:text-3xl mt-2 font-bold">Issued certificates</h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Certificates issued to your authenticated account will appear here. Complete an academy
            course and pass the final assessment to earn your first verified credential.
          </p>
        </div>
      </div>
    </main>
  );
}
