import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, CheckCircle2, ShieldCheck, Calendar, Clock, MapPin } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

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
  // Use URL params to pre-select a service if they came from /services
  const searchParams = new URLSearchParams(window.location.search);
  const requestedService = searchParams.get('service');

  return (
    <main className="min-h-screen bg-background text-slate-100">
      <PageHeader
        badge="TACTICAL ADVISORY"
        badgeVariant="primary"
        title="Schedule Operations Briefing"
        subtitle="Book a secure consultation with our senior security architects to discuss your enterprise requirements."
      />

      <section className="px-4 md:px-8 py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
          
          <div className="glass backdrop-blur-xl bg-slate-900/75 border border-border rounded-2xl p-6 md:p-10 shadow-2xl">
            <h2 className="text-2xl font-display font-bold text-white mb-8 border-b border-border pb-4">Request a Briefing</h2>
            
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Consultation request submitted securely.'); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="font-mono text-[0.65rem] text-cyan-400 mb-2 block uppercase tracking-wider">Representative Name</label>
                  <input type="text" className="w-full bg-slate-950/50 border border-border rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition placeholder:text-muted-foreground" placeholder="Jane Doe" required />
                </div>
                <div>
                  <label className="font-mono text-[0.65rem] text-cyan-400 mb-2 block uppercase tracking-wider">Official Email</label>
                  <input type="email" className="w-full bg-slate-950/50 border border-border rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition placeholder:text-muted-foreground" placeholder="jane@organization.com" required />
                </div>
              </div>

              <div>
                <label className="font-mono text-[0.65rem] text-cyan-400 mb-2 block uppercase tracking-wider">Organization Name</label>
                <input type="text" className="w-full bg-slate-950/50 border border-border rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition placeholder:text-muted-foreground" placeholder="Acme Corp" required />
              </div>

              <div>
                <label className="font-mono text-[0.65rem] text-cyan-400 mb-2 block uppercase tracking-wider">Area of Interest</label>
                <select 
                  className="w-full bg-slate-950/50 border border-border rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  defaultValue={requestedService || "general"}
                >
                  <option value="general">General Security Consultation</option>
                  <option value="cyber-ranges">Enterprise IVVAB LABSs</option>
                  <option value="audits">Security Audits & Compliance</option>
                  <option value="threat-simulation">Adversary Threat Simulation</option>
                  <option value="incident-response">Incident Response & Forensics</option>
                  <option value="training">Corporate Training</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[0.65rem] text-cyan-400 mb-2 block uppercase tracking-wider">Operational Context</label>
                <textarea rows={4} className="w-full bg-slate-950/50 border border-border rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition placeholder:text-muted-foreground" placeholder="Briefly describe your objectives or current challenges..." required></textarea>
              </div>

              <button type="submit" className="w-full py-4 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] font-mono tracking-wide text-sm flex items-center justify-center gap-2">
                SUBMIT BRIEFING REQUEST <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="glass backdrop-blur-xl bg-slate-900/75 border border-border rounded-2xl p-8 shadow-2xl">
              <ShieldCheck className="w-12 h-12 text-cyan-400 mb-6" />
              <h3 className="text-xl font-display font-bold text-white mb-4">Advisory Capabilities</h3>
              <ul className="space-y-4 text-muted-foreground text-sm">
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> 
                  <span>Zero-Trust Architecture design and implementation planning.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> 
                  <span>Custom IVVAB LABS deployment for internal red/blue teams.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> 
                  <span>Executive briefings on emerging threat vectors.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <Building2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> 
                  <span>On-site or virtual delivery of tactical operations.</span>
                </li>
              </ul>
            </div>

            <div className="glass backdrop-blur-xl bg-slate-900/75 border border-border rounded-2xl p-8 shadow-2xl">
              <h3 className="text-sm font-mono text-cyan-400 font-bold mb-4 uppercase tracking-wider">Logistics</h3>
              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Typically 45-60 minute briefing</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>Secure Video Conference (or In-Person)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-500" />
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
