import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useServerFn } from "@tanstack/react-start";
import { analyzeEvidence } from "@/lib/fraud.functions";
import { toast } from "sonner";
import { AlertTriangle, Upload } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/complaint")({
  head: () => ({
    meta: [
      { title: "Report Security Incident — NISQ Vanguard Defence Technologies" },
      {
        name: "description",
        content:
          "Report a cybersecurity incident to NISQ Vanguard. Attach optional evidence securely; text-only submissions are always accepted.",
      },
    ],
  }),
  component: Complaint,
});

const UPLOAD_ERROR_MESSAGE =
  "Evidence upload is currently unavailable. Your report can still be submitted without an attachment.";

function mapError(e: unknown, context: "upload" | "submit" | "analyze"): string {
  const message = e instanceof Error ? e.message : String(e ?? "unknown error");
  const lower = message.toLowerCase();
  if (context === "upload") {
    if (lower.includes("bucket") || lower.includes("not found") || lower.includes("does not exist")) {
      return UPLOAD_ERROR_MESSAGE;
    }
    if (lower.includes("jwt") || lower.includes("expired") || lower.includes("session")) {
      return "Your session has expired. Sign in again and try uploading your evidence.";
    }
    if (lower.includes("policy") || lower.includes("row level") || lower.includes("401") || lower.includes("403")) {
      return "Evidence upload permission check failed. Your report can still be submitted text-only.";
    }
    return UPLOAD_ERROR_MESSAGE;
  }
  if (context === "submit") {
    if (lower.includes("jwt") || lower.includes("expired") || lower.includes("session")) {
      return "Your session has expired. Sign in again to submit your report.";
    }
    return "We were unable to submit your report. Please try again in a moment or return home.";
  }
  return "AI triage skipped. Human review will proceed normally.";
}

function Complaint() {
  const { user } = useAuth();
  const nav = useNavigate();
  const analyze = useServerFn(analyzeEvidence);
  const [form, setForm] = useState({ name: "", email: "", phone: "", complaint_text: "" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);

  const busy = uploading || submitting;

  const submit = async () => {
    if (!user) {
      nav({ to: "/login", search: { next: "/complaint" } });
      return;
    }
    if (!form.name || !form.email || !form.complaint_text) {
      toast.error("Please fill all required fields: name, email, and incident description.");
      return;
    }

    setUploadWarning(null);
    let evidence_url: string | null = null;
    let storagePath: string | null = null;

    if (file) {
      setUploading(true);
      try {
        const ext = (file.name.split(".").pop() || "png").toLowerCase();
        const safeName = `${Date.now()}.${ext}`;
        storagePath = `${user.id}/${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("evidence")
          .upload(storagePath, file, { contentType: file.type || "application/octet-stream", upsert: false });
        if (upErr) {
          throw upErr;
        }
        evidence_url = storagePath;
      } catch (e: unknown) {
        const userMessage = mapError(e, "upload");
        console.warn("Evidence upload failed — proceeding as text-only submission", e);
        setUploadWarning(userMessage);
        toast.warning(userMessage, { duration: 5000 });
        evidence_url = null;
        storagePath = null;
      } finally {
        setUploading(false);
      }
    }

    setSubmitting(true);
    let insertedId: string | null = null;
    try {
      const { data: inserted, error } = await supabase
        .from("complaints")
        .insert({
          user_id: user.id,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          complaint_text: form.complaint_text.trim(),
          evidence_url,
        })
        .select("id")
        .single();
      if (error) throw error;
      insertedId = inserted?.id as string;
    } catch (e: unknown) {
      const userMessage = mapError(e, "submit");
      console.error("Complaint database insert failed", e);
      toast.error(userMessage);
      setSubmitting(false);
      return;
    }

    if (storagePath && insertedId) {
      try {
        await analyze({ data: { storagePath, complaintId: insertedId } });
      } catch (e: unknown) {
        console.warn("AI triage failed — not blocking submission", e);
      }
    }

    setDone(insertedId);
    toast.success("Incident report submitted. Reference ID issued.", { duration: 5000 });
    setForm({ name: "", email: "", phone: "", complaint_text: "" });
    setFile(null);
    setUploadWarning(null);
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen">
      <PageHeader
        badge="SECURE INTAKE"
        badgeVariant="destructive"
        title="Report Security Incident"
        subtitle="Confidential incident reporting. Evidence attachments are optional and encrypted at rest."
        breadcrumbs={[{ label: "SECURITY", to: "/solutions" }, { label: "REPORT INCIDENT" }]}
      />

      <div className="px-4 md:px-8 py-8 pb-24 max-w-3xl mx-auto">
        {done ? (
          <div className="glass rounded-2xl p-8 text-center glow-cyber border border-border">
            <AlertTriangle className="w-12 h-12 text-cyber mx-auto mb-3" />
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              INCIDENT REPORT RECEIVED
            </div>
            <h2 className="display text-2xl md:text-3xl mt-3 font-bold">REPORT ACCEPTED</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">
              Our analysts are triaging your report. Reference the identifier below in all follow-up communication.
            </p>
            <div className="mt-5">
              <p className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-wider mb-1">
                REFERENCE ID
              </p>
              <div className="inline-block font-mono text-cyber break-all bg-muted/60 border border-border px-4 py-2 rounded-md text-sm">
                {done}
              </div>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors font-mono tracking-wide"
              >
                VIEW MY REPORTS
              </Link>
              <button
                onClick={() => setDone(null)}
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors font-mono tracking-wide"
              >
                FILE ANOTHER REPORT
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {uploadWarning && (
              <div
                role="alert"
                className="rounded-xl border border-warning/40 bg-warning/5 p-4 flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="text-sm text-foreground leading-relaxed">{uploadWarning}</div>
              </div>
            )}

            <div className="glass rounded-2xl p-6 md:p-8 space-y-5 border border-border">
              <div className="grid md:grid-cols-2 gap-5">
                <Field
                  label="FULL NAME (REQUIRED)"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="Your full legal name"
                />
                <Field
                  label="EMAIL (REQUIRED)"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder="contact@example.com"
                />
              </div>
              <Field
                label="PHONE"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                placeholder="+91 (optional)"
              />
              <div>
                <label className="mono text-[0.65rem] text-muted-foreground mb-2 block uppercase tracking-wider">
                  Describe the incident (REQUIRED)
                </label>
                <textarea
                  value={form.complaint_text}
                  onChange={(e) => setForm({ ...form, complaint_text: e.target.value })}
                  rows={7}
                  placeholder="When did it occur? What systems or accounts were affected? What actions have you already taken?"
                  className="w-full bg-input/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                />
              </div>
              <div>
                <label className="mono text-[0.65rem] text-muted-foreground mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <Upload className="w-3.5 h-3.5" /> EVIDENCE (OPTIONAL)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf,.txt,.csv,.zip"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setUploadWarning(null);
                  }}
                  className="w-full bg-input/40 border border-border rounded-lg px-3 py-2.5 text-sm file:mr-3 file:bg-primary file:text-primary-foreground file:border-0 file:px-3 file:py-1.5 file:rounded file:font-mono file:text-[0.7rem] file:font-semibold"
                />
                {file && (
                  <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-md bg-muted/50 border border-border">
                    <div className="font-mono text-[0.7rem] text-muted-foreground truncate pr-3">
                      {file.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-xs font-semibold text-destructive hover:underline font-mono shrink-0"
                    >
                      REMOVE
                    </button>
                  </div>
                )}
                <p className="mt-2 text-[0.7rem] text-muted-foreground leading-relaxed font-mono">
                  Attachments are encrypted and optional. If evidence upload is unavailable,
                  your report still proceeds as text-only with the same priority.
                </p>
              </div>

              <button
                onClick={() => void submit()}
                disabled={busy}
                className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-lg shadow-xs hover:bg-primary/92 transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-mono text-[0.8rem] tracking-wide"
              >
                {submitting
                  ? uploading
                    ? "UPLOADING EVIDENCE & SUBMITTING REPORT…"
                    : "SUBMITTING REPORT…"
                  : uploading
                  ? "UPLOADING EVIDENCE…"
                  : "SUBMIT REPORT"}
              </button>
              {!user && (
                <p className="text-center text-xs text-muted-foreground leading-relaxed pt-2">
                  You must be signed in to submit an incident report.{" "}
                  <Link to="/login" search={{ next: "/complaint" }} className="text-primary font-semibold hover:underline">
                    Sign in here
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mono text-[0.65rem] text-muted-foreground mb-2 block uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-input/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
      />
    </div>
  );
}
