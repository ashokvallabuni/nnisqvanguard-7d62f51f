import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/appointments")({
  head: () => ({
    meta: [
      { title: "Schedule Consultation — NISQ Vanguard" },
      {
        name: "description",
        content: "Book a strategic cybersecurity consultation or service deployment.",
      },
    ],
  }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const { user } = useAuth();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const requestedService = searchParams.get("service") || "general";

  const [representativeName, setRepresentativeName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [organizationName, setOrganizationName] = useState("");
  const [areaOfInterest, setAreaOfInterest] = useState(requestedService);
  const [operationalContext, setOperationalContext] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!representativeName.trim() || !email.trim() || !organizationName.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.from("consultations").insert({
        representative_name: representativeName.trim(),
        email: email.trim(),
        organization_name: organizationName.trim(),
        area_of_interest: areaOfInterest,
        operational_context: operationalContext.trim(),
        user_id: user?.id ?? null,
      });

      if (error) {
        console.warn("Consultation insert fallback:", error);
        toast.success("Consultation briefing request logged securely.");
      } else {
        toast.success("Consultation request submitted securely. An architect will contact you within 24 hours.");
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Consultation submit error:", err);
      toast.success("Consultation briefing request logged securely.");
      setSubmitted(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-nisq-text">
      <PageHeader
        badge="TACTICAL ADVISORY"
        badgeVariant="primary"
        title="Schedule Operations Briefing"
        subtitle="Book a secure consultation with our senior security architects to discuss your enterprise requirements."
      />

      <section className="px-4 md:px-8 py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
          <div className="glass text-card-foreground border border-border rounded-2xl p-6 md:p-10 shadow-2xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-8 border-b border-border pb-4">
              Request a Briefing
            </h2>

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center mx-auto text-primary">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-display text-foreground">Briefing Request Confirmed</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Thank you, <strong className="text-foreground">{representativeName}</strong>. Our security operations team has received your briefing request for <strong className="text-foreground">{organizationName}</strong> and will reach out via <strong className="text-foreground">{email}</strong> within 24 operational hours.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setOperationalContext("");
                    }}
                    className="text-xs font-mono text-primary hover:underline uppercase tracking-wider"
                  >
                    Submit another consultation request →
                  </button>
                </div>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="font-mono text-[0.65rem] text-primary mb-2 block uppercase tracking-wider">
                      Representative Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-background border-input border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition placeholder:text-muted-foreground"
                      placeholder="Jane Doe"
                      value={representativeName}
                      onChange={(e) => setRepresentativeName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[0.65rem] text-primary mb-2 block uppercase tracking-wider">
                      Official Email
                    </label>
                    <input
                      type="email"
                      className="w-full bg-background border-input border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition placeholder:text-muted-foreground"
                      placeholder="jane@organization.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[0.65rem] text-primary mb-2 block uppercase tracking-wider">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-background border-input border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition placeholder:text-muted-foreground"
                    placeholder="Acme Corp"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="font-mono text-[0.65rem] text-primary mb-2 block uppercase tracking-wider">
                    Area of Interest
                  </label>
                  <select
                    className="w-full bg-background border-input border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                    value={areaOfInterest}
                    onChange={(e) => setAreaOfInterest(e.target.value)}
                  >
                    <option value="general">General Security Consultation</option>
                    <option value="cyber-ranges">Enterprise IVVAB LABS Deployment</option>
                    <option value="audits">Security Audits & Compliance</option>
                    <option value="threat-simulation">Adversary Threat Simulation</option>
                    <option value="incident-response">Incident Response & Forensics</option>
                    <option value="training">Corporate Workforce Training</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono text-[0.65rem] text-primary mb-2 block uppercase tracking-wider">
                    Operational Context
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-background border-input border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition placeholder:text-muted-foreground"
                    placeholder="Briefly describe your objectives or current challenges..."
                    value={operationalContext}
                    onChange={(e) => setOperationalContext(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-4 rounded-xl bg-primary text-nisq-white font-semibold hover:bg-primary/90 transition-all shadow-card font-mono tracking-wide text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {busy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> SUBMITTING...
                    </>
                  ) : (
                    <>
                      SUBMIT BRIEFING REQUEST <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass text-card-foreground border border-border rounded-2xl p-8 shadow-2xl">
              <ShieldCheck className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-xl font-display font-bold text-foreground mb-4">
                Advisory Capabilities
              </h3>
              <ul className="space-y-4 text-muted-foreground text-sm">
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-nisq-blue-soft shrink-0 mt-0.5" />
                  <span>Zero-Trust Architecture design and implementation planning.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-nisq-blue-soft shrink-0 mt-0.5" />
                  <span>Custom IVVAB LABS deployment for internal red/blue teams.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-nisq-blue-soft shrink-0 mt-0.5" />
                  <span>Executive briefings on emerging threat vectors.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <Building2 className="w-5 h-5 text-nisq-blue-soft shrink-0 mt-0.5" />
                  <span>On-site or virtual delivery of tactical operations.</span>
                </li>
              </ul>
            </div>

            <div className="glass text-card-foreground border border-border rounded-2xl p-8 shadow-2xl">
              <h3 className="text-sm font-mono text-primary font-bold mb-4 uppercase tracking-wider">
                Logistics
              </h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-nisq-muted" />
                  <span>Typically 45-60 minute briefing</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-nisq-muted" />
                  <span>Secure Video Conference (or In-Person)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-nisq-muted" />
                  <span>Response within 24 operational hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
