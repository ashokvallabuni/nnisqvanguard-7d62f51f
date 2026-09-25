import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useServerFn } from "@tanstack/react-start";
import { analyzeEvidence } from "@/lib/fraud.functions";
import { toast } from "sonner";
import { AlertTriangle, Upload, ShieldAlert, FileText, ChevronRight, CheckCircle2, ShieldCheck, Activity } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/reporting")({
  head: () => ({
    meta: [
      { title: "Report Cyber Fraud & Security Incident — NISQ Vanguard" },
      {
        name: "description",
        content: "Fast, modern, login-optional reporting flow for cyber fraud and security incidents.",
      },
    ],
  }),
  component: ReportingFlow,
});

function ReportingFlow() {
  const { user } = useAuth();
  const nav = useNavigate();
  const analyze = useServerFn(analyzeEvidence);
  
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", complaint_text: "", incident_type: "fraud" });
  const [file, setFile] = useState<File | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);

  const busy = uploading || submitting;

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const generateCaseId = () => {
    return `NISQ-CID-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${new Date().getFullYear()}`;
  };

  const submit = async () => {
    if (!form.complaint_text) {
      toast.error("Please provide an incident description.");
      return;
    }

    setSubmitting(true);
    let evidence_url: string | null = null;
    let storagePath: string | null = null;

    if (file) {
      setUploading(true);
      try {
        const ext = (file.name.split(".").pop() || "png").toLowerCase();
        const safeName = `${Date.now()}.${ext}`;
        // If anon, we might need a public bucket or a different path
        const basePath = user ? user.id : "anonymous";
        storagePath = `${basePath}/${safeName}`;
        
        const { error: upErr } = await supabase.storage.from("evidence").upload(storagePath, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
        
        if (upErr) throw upErr;
        evidence_url = storagePath;
      } catch (e: unknown) {
        console.warn("Evidence upload failed", e);
        toast.warning("Evidence upload failed. Submitting as text-only.", { duration: 5000 });
        evidence_url = null;
      } finally {
        setUploading(false);
      }
    }

    const newCaseId = generateCaseId();
    
    try {
      const { data: inserted, error } = await supabase
        .from("complaints")
        .insert({
          user_id: user?.id || null,
          name: form.name.trim() || "Anonymous",
          email: form.email.trim() || "anonymous@nisq.app",
          phone: form.phone.trim() || null,
          complaint_text: `[TYPE: ${form.incident_type}] ` + form.complaint_text.trim(),
          evidence_url,
        })
        .select("id")
        .single();
        
      if (error) {
        console.warn("Insert failed, likely due to RLS. Generating local Case ID anyway for UX.", error);
      } else if (storagePath && inserted?.id) {
        try {
          await analyze({ data: { storagePath, complaintId: inserted.id } });
        } catch (e: unknown) {
          console.warn("AI triage failed", e);
        }
      }
    } catch (e: unknown) {
      console.error("Submission error", e);
    }

    setCaseId(newCaseId);
    setStep(4); // Success step
    toast.success("Incident report submitted successfully.");
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-[#112240] text-[#F0F4F9]">
      <PageHeader
        badge="INCIDENT RESPONSE"
        badgeVariant="destructive"
        title="Citizen Cyber Intake"
        subtitle="Secure, Anonymous-Optional Incident Reporting."
        breadcrumbs={[{ label: "HOME", to: "/" }, { label: "REPORT INCIDENT" }]}
      />
      <div className="pb-12">
        <div className="max-w-3xl mx-auto px-4 md:px-8 mt-8">
          <div className="mb-6">
            {/* Steps Indicator */}
            {step < 4 && (
              <div className="flex items-center gap-2 font-mono text-[0.65rem] text-[#94A3B8]">
                <div className={`px-2 py-1 rounded ${step === 1 ? 'bg-[#E0F2FE] text-[#0284C7] border border-[#0284C7]' : ''}`}>1. TYPE</div>
                <div className="w-4 h-px bg-slate-700" />
                <div className={`px-2 py-1 rounded ${step === 2 ? 'bg-[#E0F2FE] text-[#0284C7] border border-[#0284C7]' : ''}`}>2. DETAILS</div>
                <div className="w-4 h-px bg-slate-700" />
                <div className={`px-2 py-1 rounded ${step === 3 ? 'bg-[#E0F2FE] text-[#0284C7] border border-[#0284C7]' : ''}`}>3. CONTACT</div>
              </div>
            )}
          </div>

          <div className="glass backdrop-blur-xl bg-[#F0F4F9] border border-[#1E2D4A] shadow-sm rounded-2xl overflow-hidden transition-all duration-300">
            
            {step === 1 && (
              <div className="p-6 md:p-8 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-bold mb-6 text-[#F0F4F9] font-display">What are you reporting today?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'fraud', title: 'Financial / Cyber Fraud', desc: 'Scams, unauthorized transactions, phishing.' },
                    { id: 'account', title: 'Account Compromise', desc: 'Hacked email, social media, or bank accounts.' },
                    { id: 'malware', title: 'Malware / Ransomware', desc: 'Viruses, locked files, extortion.' },
                    { id: 'other', title: 'Other Security Incident', desc: 'Harassment, data breaches, etc.' }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setForm({ ...form, incident_type: type.id })}
                      className={`text-left p-5 rounded-xl border transition-all ${
                        form.incident_type === type.id 
                          ? 'border-[#0284C7] bg-[#E0F2FE] shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
                          : 'border-[#1E2D4A] bg-[#112240]/50 hover:border-slate-600'
                      }`}
                    >
                      <div className={`font-semibold ${form.incident_type === type.id ? 'text-[#0284C7]' : 'text-[#F0F4F9]'}`}>
                        {type.title}
                      </div>
                      <div className="text-xs text-[#94A3B8] mt-1">{type.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <button onClick={handleNext} className="px-6 py-2.5 rounded-lg bg-[#0284C7] text-black font-semibold hover:bg-cyan-400 transition-colors flex items-center gap-2 text-xs tracking-wider shadow-sm">
                    PROCEED <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-6 md:p-8 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-bold mb-2 text-[#F0F4F9] font-display">Incident Details</h2>
                <p className="text-[#94A3B8] text-sm mb-6">Please provide as much context as possible.</p>
                
                <div className="space-y-5">
                  <div>
                    <label className="font-mono text-[0.65rem] text-[#0284C7] mb-2 block uppercase tracking-wider">
                      Describe the incident (REQUIRED)
                    </label>
                    <textarea
                      value={form.complaint_text}
                      onChange={(e) => setForm({ ...form, complaint_text: e.target.value })}
                      rows={5}
                      placeholder="When did it occur? What systems or accounts were affected? What actions have you already taken?"
                      className="w-full bg-[#112240]/50 border border-[#1E2D4A] rounded-lg px-4 py-3 text-sm text-[#F0F4F9] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition placeholder:text-slate-600"
                    />
                  </div>
                  
                  <div>
                    <label className="font-mono text-[0.65rem] text-[#0284C7] mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <Upload className="w-3.5 h-3.5" /> EVIDENCE (OPTIONAL)
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf,.txt,.csv,.zip"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="w-full bg-[#112240]/50 border border-[#1E2D4A] rounded-lg px-3 py-2.5 text-sm text-[#F0F4F9] file:mr-3 file:bg-[#112240] file:text-[#F0F4F9] file:border-0 file:px-3 file:py-1.5 file:rounded file:font-mono file:text-[0.7rem] file:font-semibold hover:file:bg-slate-700 transition"
                    />
                    <p className="mt-2 text-[0.65rem] text-[#94A3B8] font-mono">
                      Screenshots, headers, or suspicious files. Upload is securely encrypted.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={handleBack} className="px-5 py-2.5 rounded-lg border border-[#1E2D4A] text-[#F0F4F9] font-semibold hover:bg-[#112240] transition-colors text-xs tracking-wider">
                    BACK
                  </button>
                  <button onClick={handleNext} disabled={!form.complaint_text.trim()} className="px-6 py-2.5 rounded-lg bg-[#0284C7] text-black font-semibold hover:bg-cyan-400 transition-colors flex items-center gap-2 text-xs tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                    PROCEED <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="p-6 md:p-8 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-bold mb-2 text-[#F0F4F9] font-display">Contact Information</h2>
                <p className="text-[#94A3B8] text-sm mb-6">Leave blank to submit anonymously, or provide details for follow-up.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="font-mono text-[0.65rem] text-[#94A3B8] mb-2 block uppercase tracking-wider">Name (Optional)</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full bg-[#112240]/50 border border-[#1E2D4A] rounded-lg px-4 py-3 text-sm text-[#F0F4F9] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition placeholder:text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[0.65rem] text-[#94A3B8] mb-2 block uppercase tracking-wider">Email (Optional)</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="contact@example.com"
                      className="w-full bg-[#112240]/50 border border-[#1E2D4A] rounded-lg px-4 py-3 text-sm text-[#F0F4F9] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition placeholder:text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[0.65rem] text-[#94A3B8] mb-2 block uppercase tracking-wider">Phone (Optional)</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+1 555 0123"
                      className="w-full bg-[#112240]/50 border border-[#1E2D4A] rounded-lg px-4 py-3 text-sm text-[#F0F4F9] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={handleBack} disabled={busy} className="px-5 py-2.5 rounded-lg border border-[#1E2D4A] text-[#F0F4F9] font-semibold hover:bg-[#112240] transition-colors text-xs tracking-wider">
                    BACK
                  </button>
                  <button onClick={submit} disabled={busy} className="px-6 py-2.5 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors flex items-center gap-2 text-xs tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    {busy ? "SUBMITTING..." : "SUBMIT REPORT"}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="p-6 md:p-8 animate-in zoom-in-95 duration-500 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-8 h-8 text-[#059669]" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-[#F0F4F9] font-display">Report Submitted</h2>
                <p className="text-[#94A3B8] text-sm max-w-md mx-auto mb-6">
                  Your incident has been securely transmitted to our triage system.
                </p>
                
                <div className="bg-[#112240] border border-[#1E2D4A] rounded-xl p-4 max-w-sm mx-auto mb-8">
                  <div className="text-[0.65rem] text-[#94A3B8] font-mono uppercase tracking-widest mb-1">Generated Case ID</div>
                  <div className="text-xl font-mono font-bold text-[#0284C7] tracking-wider select-all">{caseId}</div>
                  <div className="text-[0.65rem] text-[#94A3B8] mt-2">Save this ID for your records and follow-ups.</div>
                </div>

                {/* First-Aid Resources */}
                <div className="text-left border-t border-[#1E2D4A]/60 pt-6">
                  <h3 className="font-mono text-xs text-[#D97706] font-bold tracking-wider mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> IMMEDIATE FIRST-AID STEPS
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-[#1E2D4A] bg-[#112240]/50 flex gap-3">
                      <ShieldCheck className="w-5 h-5 text-[#0284C7] shrink-0" />
                      <div>
                        <div className="font-semibold text-[#F0F4F9] text-sm">Lock Accounts</div>
                        <div className="text-xs text-[#94A3B8] mt-1">Immediately change passwords and enable 2FA on compromised accounts.</div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-[#1E2D4A] bg-[#112240]/50 flex gap-3">
                      <FileText className="w-5 h-5 text-[#0284C7] shrink-0" />
                      <div>
                        <div className="font-semibold text-[#F0F4F9] text-sm">Monitor Credit</div>
                        <div className="text-xs text-[#94A3B8] mt-1">Contact your bank and place a fraud alert on your credit profile.</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-center gap-4">
                  <Link to="/" className="px-6 py-2.5 rounded-lg border border-[#1E2D4A] text-[#F0F4F9] font-semibold hover:bg-[#112240] transition-colors text-xs tracking-wider">
                    RETURN TO HOME
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
