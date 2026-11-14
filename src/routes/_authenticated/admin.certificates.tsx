import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Shield, Search, RefreshCw, XCircle, CheckCircle2, AlertTriangle, FileSpreadsheet, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/common/PageHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/certificates")({
  component: AdminCertificatesPage,
});

function AdminCertificatesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  const { data: certificates, isLoading, refetch } = useQuery({
    queryKey: ["admin-certificates", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("certificates")
        .select("id, certificate_number, recipient_name, course_title, issued_at, final_score, blockchain_status, blockchain_tx_hash, email_status, revoked, revoked_reason, user_id")
        .order("issued_at", { ascending: false });

      if (statusFilter === "REVOKED") {
        query = query.eq("revoked", true);
      } else if (statusFilter === "ACTIVE") {
        query = query.eq("revoked", false);
      } else if (statusFilter === "EMAIL_FAILED") {
        query = query.eq("email_status", "FAILED");
      }

      const { data, error } = await query;
      if (error) {
        toast.error("Failed to load certificates");
        return [];
      }
      return data || [];
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from("certificates")
        .update({
          revoked: true,
          revoked_reason: reason,
          revoked_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      await supabase.from("certificate_audit_logs").insert({
        certificate_id: id,
        event_type: "CERTIFICATE_REVOKED_BY_ADMIN",
        details: { reason, timestamp: new Date().toISOString() },
      });
    },
    onSuccess: () => {
      toast.success("Certificate successfully revoked");
      setRevokingId(null);
      setRevokeReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
    },
    onError: (err: any) => {
      toast.error(`Revocation failed: ${err.message}`);
    },
  });

  const filteredCerts = (certificates || []).filter(
    (c) =>
      c.certificate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.course_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCsv = () => {
    if (!filteredCerts.length) return;
    const headers = ["Certificate Number,Recipient,Course,Issued Date,Score,Blockchain Status,Email Status,Revoked"];
    const rows = filteredCerts.map((c) =>
      `"${c.certificate_number}","${c.recipient_name}","${c.course_title}","${c.issued_at}","${c.final_score || ''}","${c.blockchain_status}","${c.email_status}","${c.revoked}"`
    );
    const blob = new Blob([headers.concat(rows).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nisq-certificates-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <main className="min-h-screen pb-16">
      <PageHeader
        badge="ADMIN CONSOLE"
        badgeVariant="destructive"
        title="Certificate Governance & Audit"
        subtitle="Manage issued credentials, blockchain anchoring, email retries, and cryptographic revocations."
        breadcrumbs={[{ label: "ADMIN", to: "/admin" }, { label: "CERTIFICATES" }]}
      />

      <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-6">
        {/* Controls Bar */}
        <div className="glass rounded-xl p-6 border border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3 w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search certificate ID, student name, or course..."
                className="w-full pl-9 pr-4 py-2 bg-background/50 border border-border rounded-lg text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background/50 border border-border rounded-lg text-xs text-white px-3 py-2 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="REVOKED">Revoked Only</option>
              <option value="EMAIL_FAILED">Email Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg text-slate-300 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 text-xs font-mono bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* Certificate Table */}
        <div className="glass rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-border text-muted-foreground font-mono uppercase">
                <tr>
                  <th className="p-4">Certificate ID</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Chain Status</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground font-mono">
                      Loading certificates...
                    </td>
                  </tr>
                ) : filteredCerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground font-mono">
                      No matching certificate records found.
                    </td>
                  </tr>
                ) : (
                  filteredCerts.map((cert) => (
                    <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono font-bold text-primary">{cert.certificate_number}</td>
                      <td className="p-4 text-white font-medium">{cert.recipient_name}</td>
                      <td className="p-4 text-slate-300 max-w-[200px] truncate">{cert.course_title}</td>
                      <td className="p-4 font-mono">{cert.final_score ? `${cert.final_score}%` : "—"}</td>
                      <td className="p-4">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/5 border border-border">
                          {cert.blockchain_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-mono text-[11px] px-2 py-0.5 rounded border ${
                            cert.email_status === "SENT"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {cert.email_status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {cert.revoked ? (
                          <span className="text-[11px] font-mono text-red-400">REVOKED</span>
                        ) : (
                          <button
                            onClick={() => setRevokingId(cert.id)}
                            className="text-xs text-red-400 hover:text-red-300 font-mono bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded border border-red-500/20 transition-colors cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revocation Modal */}
        {revokingId && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="glass max-w-md w-full rounded-xl border border-red-500/40 p-6 space-y-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Revoke Certificate</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Revoking this credential immediately flags it as INVALID on all public verification portals and registers the revocation event in the immutable audit log.
              </p>
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5">Mandatory Revocation Reason</label>
                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Assessment academic integrity violation or unauthorized completion"
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg text-xs text-white p-3 focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setRevokingId(null);
                    setRevokeReason("");
                  }}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!revokeReason.trim() || revokeMutation.isPending}
                  onClick={() => revokeMutation.mutate({ id: revokingId, reason: revokeReason })}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {revokeMutation.isPending ? "Revoking..." : "Confirm Revocation"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

