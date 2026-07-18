import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/complaints")({ component: ComplaintsAdmin });

type Complaint = { id: string; name: string; email: string; phone: string | null; complaint_text: string; evidence_url: string | null; fraud_score: number | null; verdict: string | null; ai_result: unknown; status: string; created_at: string };

function ComplaintsAdmin() {
  const qc = useQueryClient();
  const [signed, setSigned] = useState<Record<string, string>>({});
  const { data } = useQuery({
    queryKey: ["admin-complaints"],
    queryFn: async () => {
      const { data } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Complaint[];
    },
  });

  const viewEvidence = async (c: Complaint) => {
    if (!c.evidence_url) return;
    if (signed[c.id]) { window.open(signed[c.id], "_blank"); return; }
    const { data } = await supabase.storage.from("evidence").createSignedUrl(c.evidence_url, 3600);
    if (data?.signedUrl) { setSigned((s) => ({ ...s, [c.id]: data.signedUrl })); window.open(data.signedUrl, "_blank"); }
  };
  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("complaints").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["admin-complaints"] });
  };

  return (
    <div>
      <h1 className="display text-3xl mb-6">Complaints</h1>
      <div className="space-y-3">
        {(!data || data.length === 0) ? <div className="glass rounded-xl p-8 text-muted-foreground text-sm">No complaints.</div> :
          data.map((c) => (
            <div key={c.id} className="glass rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-semibold">{c.name} <span className="mono text-[0.6rem] text-muted-foreground">· {c.email} · {c.phone ?? "no phone"}</span></div>
                  <div className="mono text-[0.55rem] text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  {c.verdict && (
                    <span className={`mono text-[0.6rem] px-2 py-1 rounded border ${c.verdict === "Fraud" ? "text-destructive border-destructive/40" : c.verdict === "Suspicious" ? "text-warning border-warning/40" : "text-success border-success/40"}`}>
                      {c.verdict.toUpperCase()} · {c.fraud_score}/100
                    </span>
                  )}
                  <span className="mono text-[0.55rem] px-2 py-1 rounded border">{c.status.toUpperCase()}</span>
                </div>
              </div>
              <p className="text-sm mb-3">{c.complaint_text}</p>
              {Boolean(c.ai_result) && typeof c.ai_result === "object" && (
                <div className="rounded bg-secondary/40 p-3 mb-3 text-xs">
                  <div className="mono text-[0.55rem] text-cyber mb-1">AI ANALYSIS</div>
                  <div><b>Explanation:</b> {(c.ai_result as { explanation?: string }).explanation}</div>
                  <div className="mt-1"><b>Action:</b> {(c.ai_result as { recommended_action?: string }).recommended_action}</div>
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                {c.evidence_url && <button onClick={() => viewEvidence(c)} className="mono text-[0.6rem] px-3 py-1 rounded border border-primary/40 text-cyber">VIEW EVIDENCE</button>}
                <button onClick={() => update(c.id, "in_review")} className="mono text-[0.6rem] px-3 py-1 rounded border">MARK IN REVIEW</button>
                <button onClick={() => update(c.id, "resolved")} className="mono text-[0.6rem] px-3 py-1 rounded border border-success/40 text-success">RESOLVE</button>
                <button onClick={() => update(c.id, "rejected")} className="mono text-[0.6rem] px-3 py-1 rounded border border-destructive/40 text-destructive">REJECT</button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
