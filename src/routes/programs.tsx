import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Search, Calendar } from "lucide-react";

export const Route = createFileRoute("/programs")({
  head: () => ({ meta: [{ title: "Book a Cyber Awareness Program — CyberShield India" }, { name: "description", content: "Colleges across India can book webinars, seminars and workshops on cybersecurity." }] }),
  component: Programs,
});

type College = { id: string; name: string; city: string | null; state: string | null; type: string | null };

function Programs() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<College[]>([]);
  const [selected, setSelected] = useState<College | null>(null);
  const [form, setForm] = useState({ contact_person: "", email: "", phone: "", program_type: "Webinar", topic: "", preferred_date: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (q.length < 2) { setResults([]); return; }
      const { data } = await supabase.from("colleges").select("id,name,city,state,type").ilike("name", `%${q}%`).limit(10);
      setResults((data ?? []) as College[]);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const submit = async () => {
    if (!user) { nav({ to: "/auth", search: { next: "/programs" } }); return; }
    if (!selected) { toast.error("Select a college"); return; }
    if (!form.contact_person || !form.email || !form.phone || !form.topic) { toast.error("Fill all required fields"); return; }
    setBusy(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      college_id: selected.id,
      contact_person: form.contact_person,
      email: form.email,
      phone: form.phone,
      program_type: form.program_type,
      topic: form.topic,
      preferred_date: form.preferred_date || null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking submitted! Admin will review shortly.");
    setSelected(null); setQ("");
    setForm({ contact_person: "", email: "", phone: "", program_type: "Webinar", topic: "", preferred_date: "" });
  };

  return (
    <main className="pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mono text-xs text-cyber mb-2">// COLLEGE OUTREACH</div>
        <h1 className="display text-4xl md:text-5xl mb-2">Book a Cyber Awareness Program</h1>
        <p className="text-muted-foreground mb-10">Search your college and request a webinar, seminar or workshop.</p>

        <div className="glass rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <label className="mono text-[0.6rem] text-muted-foreground flex items-center gap-1 mb-2"><Search className="w-3 h-3" /> COLLEGE</label>
            {selected ? (
              <div className="flex items-center justify-between p-3 rounded-md bg-primary/10 border border-primary/40">
                <div>
                  <div className="font-semibold">{selected.name}</div>
                  <div className="mono text-[0.6rem] text-muted-foreground">{selected.city}, {selected.state} · {selected.type}</div>
                </div>
                <button onClick={() => setSelected(null)} className="mono text-[0.6rem] text-cyber">CHANGE</button>
              </div>
            ) : (
              <div className="relative">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Indian colleges..."
                  className="w-full bg-input/40 border border-border rounded-md px-3 py-3 focus:outline-none focus:border-primary" />
                {results.length > 0 && (
                  <div className="absolute z-10 inset-x-0 mt-1 glass rounded-md max-h-72 overflow-auto">
                    {results.map((c) => (
                      <button key={c.id} onClick={() => { setSelected(c); setResults([]); setQ(""); }} className="w-full text-left px-3 py-2 hover:bg-primary/10 border-b border-border/30">
                        <div className="text-sm">{c.name}</div>
                        <div className="mono text-[0.55rem] text-muted-foreground">{c.city}, {c.state}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="CONTACT PERSON" value={form.contact_person} onChange={(v) => setForm({ ...form, contact_person: v })} />
            <Field label="EMAIL" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="PHONE" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <div>
              <label className="mono text-[0.6rem] text-muted-foreground mb-2 block">PROGRAM TYPE</label>
              <select value={form.program_type} onChange={(e) => setForm({ ...form, program_type: e.target.value })}
                className="w-full bg-input/40 border border-border rounded-md px-3 py-3 focus:outline-none focus:border-primary">
                <option>Webinar</option><option>Seminar</option><option>Workshop</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Field label="TOPIC" value={form.topic} onChange={(v) => setForm({ ...form, topic: v })} placeholder="e.g. UPI Fraud Prevention, Phishing Awareness..." />
            </div>
            <div className="md:col-span-2">
              <label className="mono text-[0.6rem] text-muted-foreground mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> PREFERRED DATE</label>
              <input type="date" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                className="w-full bg-input/40 border border-border rounded-md px-3 py-3 focus:outline-none focus:border-primary" />
            </div>
          </div>

          <button onClick={submit} disabled={busy || !selected} className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-md glow-cyber disabled:opacity-50">
            {busy ? "SUBMITTING..." : "SUBMIT BOOKING"}
          </button>
          {!user && <p className="text-center text-xs text-muted-foreground">You'll need to <Link to="/auth" search={{ next: "/programs" }} className="text-cyber">sign in</Link> to submit.</p>}
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="mono text-[0.6rem] text-muted-foreground mb-2 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-input/40 border border-border rounded-md px-3 py-3 focus:outline-none focus:border-primary" />
    </div>
  );
}
