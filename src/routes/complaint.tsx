import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useServerFn } from "@tanstack/react-start";
import { analyzeEvidence } from "@/lib/fraud.functions";
import { toast } from "sonner";
import { AlertTriangle, Upload } from "lucide-react";

export const Route = createFileRoute("/complaint")({
  head: () => ({
    meta: [
      { title: "File a Cybercrime Complaint — CyberShield India" },
      {
        name: "description",
        content:
          "Report cyber fraud with evidence. Every complaint is AI-triaged before human review.",
      },
    ],
  }),
  component: Complaint,
});

function Complaint() {
  const { user } = useAuth();
  const nav = useNavigate();
  const analyze = useServerFn(analyzeEvidence);
  const [form, setForm] = useState({ name: "", email: "", phone: "", complaint_text: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const submit = async () => {
    if (!user) {
      nav({ to: "/login", search: { next: "/complaint" } });
      return;
    }
    if (!form.name || !form.email || !form.complaint_text) {
      toast.error("Fill required fields");
      return;
    }
    setBusy(true);
    try {
      let evidence_url: string | null = null;
      let storagePath: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "png";
        storagePath = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("evidence")
          .upload(storagePath, file, { contentType: file.type });
        if (upErr) throw upErr;
        evidence_url = storagePath;
      }
      const { data: inserted, error } = await supabase
        .from("complaints")
        .insert({
          user_id: user.id,
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          complaint_text: form.complaint_text,
          evidence_url,
        })
        .select("id")
        .single();
      if (error) throw error;

      if (storagePath && inserted?.id) {
        try {
          await analyze({ data: { storagePath, complaintId: inserted.id as string } });
        } catch (e) {
          console.warn("AI triage failed", e);
        }
      }
      setDone(inserted!.id as string);
      toast.success("Complaint submitted");
      setForm({ name: "", email: "", phone: "", complaint_text: "" });
      setFile(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mono text-xs text-cyber mb-2">// SECURE COMPLAINT INTAKE</div>
        <h1 className="display text-4xl md:text-5xl mb-2">File a Cybercrime Complaint</h1>
        <p className="text-muted-foreground mb-10">
          Describe the incident and attach evidence. Our AI reviews attachments instantly.
        </p>

        {done ? (
          <div className="glass rounded-2xl p-8 text-center glow-cyber">
            <AlertTriangle className="w-12 h-12 text-cyber mx-auto mb-3" />
            <h2 className="display text-2xl mb-2">COMPLAINT RECEIVED</h2>
            <p className="text-muted-foreground mb-2">Reference ID</p>
            <div className="mono text-cyber mb-6 break-all">{done}</div>
            <Link
              to="/dashboard"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold"
            >
              View my complaints
            </Link>
            <button onClick={() => setDone(null)} className="ml-3 border px-6 py-3 rounded-md">
              File another
            </button>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 md:p-8 space-y-4">
            <Field
              label="FULL NAME"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <Field
                label="EMAIL"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />
              <Field
                label="PHONE"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
            </div>
            <div>
              <label className="mono text-[0.6rem] text-muted-foreground mb-2 block">
                DESCRIBE THE INCIDENT
              </label>
              <textarea
                value={form.complaint_text}
                onChange={(e) => setForm({ ...form, complaint_text: e.target.value })}
                rows={5}
                className="w-full bg-input/40 border border-border rounded-md px-3 py-3 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mono text-[0.6rem] text-muted-foreground mb-2 flex items-center gap-1">
                <Upload className="w-3 h-3" /> EVIDENCE (OPTIONAL)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full bg-input/40 border border-border rounded-md px-3 py-2 text-sm file:mr-3 file:bg-primary file:text-primary-foreground file:border-0 file:px-3 file:py-1 file:rounded"
              />
              {file && (
                <div className="mono text-[0.6rem] text-muted-foreground mt-2">{file.name}</div>
              )}
            </div>
            <button
              onClick={submit}
              disabled={busy}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-md glow-cyber disabled:opacity-50"
            >
              {busy ? "SUBMITTING & ANALYZING..." : "SUBMIT COMPLAINT"}
            </button>
            {!user && (
              <p className="text-center text-xs text-muted-foreground">
                <Link to="/login" search={{ next: "/complaint" }} className="text-cyber">
                  Sign in
                </Link>{" "}
                to submit.
              </p>
            )}
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mono text-[0.6rem] text-muted-foreground mb-2 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-input/40 border border-border rounded-md px-3 py-3 focus:outline-none focus:border-primary"
      />
    </div>
  );
}
