import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useServerFn } from "@tanstack/react-start";
import { analyzeEvidence } from "@/lib/fraud.functions";
import { toast } from "sonner";
import { Upload, ScanSearch, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/fraud-check")({
  head: () => ({
    meta: [
      { title: "AI Fraud Detection — CyberShield India" },
      {
        name: "description",
        content: "Upload a screenshot and get instant AI-powered fraud analysis.",
      },
    ],
  }),
  component: FraudCheck,
});

type Result = {
  fraud_score: number;
  verdict: "Safe" | "Suspicious" | "Fraud";
  explanation: string;
  recommended_action: string;
};

function FraudCheck() {
  const { user } = useAuth();
  const nav = useNavigate();
  const analyze = useServerFn(analyzeEvidence);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const onFile = (f: File | null) => {
    setFile(f);
    setResult(null);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const run = async () => {
    if (!user) {
      nav({ to: "/login", search: { next: "/fraud-check" } });
      return;
    }
    if (!file) {
      toast.error("Choose an image or PDF");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("evidence")
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const r = await analyze({ data: { storagePath: path } });
      setResult(r as Result);
      toast.success("Analysis complete");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setBusy(false);
    }
  };

  const V = result?.verdict;
  const color =
    V === "Fraud"
      ? "text-destructive"
      : V === "Suspicious"
        ? "text-warning"
        : V === "Safe"
          ? "text-success"
          : "";
  const Icon = V === "Fraud" ? ShieldAlert : V === "Suspicious" ? AlertTriangle : ShieldCheck;

  return (
    <main className="pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mono text-xs text-cyber mb-2">// AI VISION ANALYSIS</div>
        <h1 className="display text-4xl md:text-5xl mb-2">Screenshot Fraud Detection</h1>
        <p className="text-muted-foreground mb-10">
          Upload a suspicious message, email, or payment request. Our AI returns a fraud score in
          seconds.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <label className="mono text-[0.6rem] text-muted-foreground mb-3 flex items-center gap-1">
              <Upload className="w-3 h-3" /> EVIDENCE FILE
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition">
              <input
                id="f"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <label htmlFor="f" className="cursor-pointer block">
                {preview ? (
                  <img src={preview} alt="Evidence preview" className="max-h-64 mx-auto rounded" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto text-cyber mb-2" />
                    <div className="text-sm">Click to upload screenshot</div>
                    <div className="mono text-[0.55rem] text-muted-foreground mt-1">
                      PNG · JPG · PDF · Max 10MB
                    </div>
                  </>
                )}
              </label>
            </div>
            {file && (
              <div className="mono text-[0.65rem] text-muted-foreground mt-3 truncate">
                {file.name}
              </div>
            )}
            <button
              onClick={run}
              disabled={busy || !file}
              className="mt-4 w-full bg-primary text-primary-foreground font-semibold py-3 rounded-md glow-cyber disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ScanSearch className="w-4 h-4" /> {busy ? "ANALYZING..." : "RUN AI ANALYSIS"}
            </button>
            {!user && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                <Link to="/login" search={{ next: "/fraud-check" }} className="text-cyber">
                  Sign in
                </Link>{" "}
                required
              </p>
            )}
          </div>

          <div className="glass rounded-2xl p-6 min-h-[300px]">
            <div className="mono text-[0.6rem] text-muted-foreground mb-3">// ANALYSIS RESULT</div>
            {!result ? (
              <div className="h-full flex items-center justify-center text-center text-muted-foreground text-sm">
                Awaiting evidence upload...
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-20 h-20 rounded-full border-4 border-current ${color} flex items-center justify-center`}
                  >
                    <span className="display text-3xl">{result.fraud_score}</span>
                  </div>
                  <div>
                    <div className={`flex items-center gap-2 ${color}`}>
                      <Icon className="w-5 h-5" />
                      <span className="display text-2xl">{result.verdict.toUpperCase()}</span>
                    </div>
                    <div className="mono text-[0.6rem] text-muted-foreground">
                      FRAUD SCORE / 100
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="mono text-[0.6rem] text-cyber mb-1">EXPLANATION</div>
                    <p className="text-sm">{result.explanation}</p>
                  </div>
                  <div>
                    <div className="mono text-[0.6rem] text-cyber mb-1">RECOMMENDED ACTION</div>
                    <p className="text-sm">{result.recommended_action}</p>
                  </div>
                  <Link
                    to="/complaint"
                    className="block text-center mt-4 border border-primary/40 rounded-md py-2 mono text-xs hover:bg-primary/10"
                  >
                    FILE A FORMAL COMPLAINT →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
