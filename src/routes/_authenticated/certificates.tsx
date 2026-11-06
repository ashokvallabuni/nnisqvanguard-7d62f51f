import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Shield, Award, Download, ExternalLink, RefreshCw, CheckCircle2, Clock, XCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/common/PageHeader";
import { getCertificateDownloadUrl } from "@/lib/certificate.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/certificates")({
  head: () => ({
    meta: [
      { title: "My Verified Certificates — NISQ Vanguard Academy" },
      { name: "description", content: "Official verified cybersecurity course and master track credentials." },
    ],
  }),
  component: CertificatesPage,
});

function CertificatesPage() {
  const { user } = useAuth();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: certificates, isLoading, refetch } = useQuery({
    queryKey: ["my-certificates", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("certificates")
        .select("id, certificate_number, course_title, issued_at, final_score, blockchain_status, blockchain_tx_hash, email_status, revoked")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });

      if (error) {
        console.error("Error fetching certificates:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleDownload = async (certNumber: string) => {
    try {
      setDownloadingId(certNumber);
      const res = await getCertificateDownloadUrl({ data: { certificateNumber: certNumber } });
      if (res.downloadUrl) {
        window.open(res.downloadUrl, "_blank");
      } else {
        toast.error("Unable to generate download link. Please try again.");
      }
    } catch {
      toast.error("Download failed. Please refresh and retry.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <main className="min-h-screen pb-16">
      <PageHeader
        badge="VERIFIED CREDENTIALS"
        badgeVariant="success"
        title="My Certificates"
        subtitle="Official NISQ Vanguard certificates awarded for completed programs and verified on-chain."
        breadcrumbs={[{ label: "WORKSPACE", to: "/dashboard" }, { label: "CERTIFICATES" }]}
      />

      <div className="px-4 md:px-8 py-8 max-w-5xl mx-auto space-y-6">
        {/* Certificate Overview Banner */}
        <div className="glass rounded-xl p-6 md:p-8 border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="mono text-xs text-cyber">// CREDENTIAL VAULT</p>
            <h2 className="display text-2xl font-bold mt-1">Official Academy Certifications</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Deterministic, tamper-proof credentials awarded upon verified completion of core courses and master tracks.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg transition-colors text-slate-300 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Vault
          </button>
        </div>

        {/* Certificate List */}
        {isLoading ? (
          <div className="glass rounded-xl p-8 border border-border text-center text-sm text-muted-foreground font-mono">
            Loading credentials from secure vault...
          </div>
        ) : !certificates || certificates.length === 0 ? (
          <div className="glass rounded-xl p-12 border border-border text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No Certificates Issued Yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              Complete all lessons, quizzes, and hands-on labs in any of the 105 Academy courses to automatically earn your verified credential.
            </p>
            <Link
              to="/dashboard"
              className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors"
            >
              Continue Learning
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {certificates.map((cert) => {
              const isConfirmed = cert.blockchain_status === "CONFIRMED";
              return (
                <div
                  key={cert.id}
                  className="glass rounded-xl p-6 border border-border/80 hover:border-primary/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-primary font-semibold">
                        {cert.certificate_number}
                      </span>
                      {cert.revoked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle className="w-3 h-3" /> REVOKED
                        </span>
                      ) : isConfirmed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> ON-CHAIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> ISSUED (BLOCKCHAIN PENDING)
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white">{cert.course_title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Issued on{" "}
                      {new Date(cert.issued_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      • Score: {cert.final_score ? `${cert.final_score}%` : "Passed"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handleDownload(cert.certificate_number)}
                      disabled={downloadingId === cert.certificate_number}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-white px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {downloadingId === cert.certificate_number ? "Preparing PDF..." : "Download PDF"}
                    </button>

                    <Link
                      to="/verify-certificate/$certificateId"
                      params={{ certificateId: cert.certificate_number }}
                      target="_blank"
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-3.5 py-2 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Verify
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
