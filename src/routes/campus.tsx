import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarDays, MapPin, Search, ShieldCheck, Users, X } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/campus")({
  head: () => ({
    meta: [
      { title: "Campus Programs — NISQ Vanguard" },
      {
        name: "description",
        content:
          "Explore active NISQ Vanguard cyber education programs for colleges and universities.",
      },
    ],
  }),
  component: CampusPrograms,
});

type Program = {
  id: string;
  college_name: string;
  country: string;
  state: string;
  city: string;
  program_type: string;
  security_level: string;
  dynamic_tier: string;
  seats: number;
  enrolled_students: number;
  application_deadline: string;
  description: string | null;
};

type ConsultationForm = {
  contact_name: string;
  email: string;
  phone: string;
  organization_role: string;
  student_count: string;
  message: string;
};

const emptyForm: ConsultationForm = {
  contact_name: "",
  email: "",
  phone: "",
  organization_role: "",
  student_count: "",
  message: "",
};

function CampusPrograms() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Program | null>(null);
  const [form, setForm] = useState<ConsultationForm>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [stateFilter, setStateFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [securityFilter, setSecurityFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [workflowCount, setWorkflowCount] = useState(0);

  useEffect(() => {
    let active = true;
    void supabase
      .from("campus_programs")
      .select(
        "id,college_name,country,state,city,program_type,security_level,dynamic_tier,seats,enrolled_students,application_deadline,description",
      )
      .eq("is_active", true)
      .order("application_deadline")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) toast.error(`Unable to load campus programs: ${error.message}`);
        setPrograms((data ?? []) as Program[]);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setWorkflowCount(0);
      return;
    }
    void supabase
      .from("campus_consultations")
      .select("id", { count: "exact", head: true })
      .neq("status", "closed")
      .then(({ count, error }) => {
        if (error) {
          toast.error(`Unable to load consultation stats: ${error.message}`);
          return;
        }
        setWorkflowCount(count ?? 0);
      });
  }, [user]);

  const states = useMemo(() => unique(programs.map((program) => program.state)), [programs]);
  const cities = useMemo(
    () =>
      unique(
        programs
          .filter((program) => stateFilter === "All" || program.state === stateFilter)
          .map((program) => program.city),
      ),
    [programs, stateFilter],
  );
  const filteredPrograms = useMemo(
    () =>
      programs.filter((program) => {
        const matchesSearch =
          !search ||
          `${program.college_name} ${program.city} ${program.state}`
            .toLowerCase()
            .includes(search.toLowerCase());
        return (
          matchesSearch &&
          (stateFilter === "All" || program.state === stateFilter) &&
          (cityFilter === "All" || program.city === cityFilter) &&
          (typeFilter === "All" || program.program_type === typeFilter) &&
          (securityFilter === "All" || program.security_level === securityFilter)
        );
      }),
    [cityFilter, programs, search, securityFilter, stateFilter, typeFilter],
  );

  const stats = useMemo(
    () => ({
      colleges: new Set(programs.map((program) => program.college_name)).size,
      workflows: workflowCount,
      students: programs.reduce((total, program) => total + program.enrolled_students, 0),
    }),
    [programs, workflowCount],
  );

  const openConsultation = (program: Program) => {
    if (!user) {
      void navigate({ to: "/login", search: { next: "/campus" } });
      return;
    }
    setSelected(program);
    setForm({
      ...emptyForm,
      email: user.email ?? "",
      contact_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
    });
  };

  const submitConsultation = async () => {
    if (!user || !selected) return;
    if (!form.contact_name.trim() || !form.email.trim()) {
      toast.error("Contact name and email are required.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("campus_consultations").insert({
      user_id: user.id,
      college_id: selected.id,
      contact_name: form.contact_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      organization_role: form.organization_role.trim() || null,
      student_count: form.student_count ? Number(form.student_count) : null,
      requested_program_type: selected.program_type,
      message: form.message.trim() || null,
    });
    setBusy(false);
    if (error) {
      toast.error(`Unable to submit consultation: ${error.message}`);
      return;
    }
    toast.success("Campus consultation submitted. Our team will contact you shortly.");
    setSelected(null);
    setForm(emptyForm);
  };

  return (
    <main className="min-h-screen bg-[#030712] px-4 pb-20 pt-28 text-slate-200 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <div className="mono text-xs tracking-[0.18em] text-cyan-300">// CAMPUS PROGRAMS</div>
          <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-6xl">
            CONNECT THE CAMPUS
          </h1>
          <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-slate-400">
            Discover active cyber education and cyber-range programs across the NISQ Vanguard
            college network. Filter by location, program format and security level.
          </p>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard icon={Building2} label="Total Connected Colleges" value={stats.colleges} />
          <StatCard
            icon={ShieldCheck}
            label="Active Consultation Workflows"
            value={stats.workflows}
          />
          <StatCard
            icon={Users}
            label="Enrolled Students"
            value={stats.students.toLocaleString()}
          />
        </div>

        <section className="mb-8 grid gap-3 border border-slate-800 bg-[#0a0f1d] p-4 md:grid-cols-5">
          <label className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-cyan-300" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search college, city or state"
              className="w-full border border-slate-700 bg-slate-950 px-10 py-2.5 font-mono text-xs text-white outline-none focus:border-cyan-400"
            />
          </label>
          <Filter
            value={stateFilter}
            onChange={(value) => {
              setStateFilter(value);
              setCityFilter("All");
            }}
            options={states}
            placeholder="State"
          />
          <Filter value={cityFilter} onChange={setCityFilter} options={cities} placeholder="City" />
          <Filter
            value={typeFilter}
            onChange={setTypeFilter}
            options={["Webinar", "Seminar", "Workshop", "Cyber Range"]}
            placeholder="Program Type"
          />
          <Filter
            value={securityFilter}
            onChange={setSecurityFilter}
            options={["Foundation", "Professional", "Advanced"]}
            placeholder="Security Level"
          />
        </section>

        {loading ? (
          <p className="py-16 text-center font-mono text-sm text-cyan-300">
            LOADING CAMPUS DIRECTORY...
          </p>
        ) : filteredPrograms.length === 0 ? (
          <div className="border border-dashed border-slate-700 py-16 text-center font-mono text-sm text-slate-400">
            No active programs match these filters.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onApply={() => openConsultation(program)}
              />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-cyan-400/50 bg-[#0a0f1d] p-6 shadow-[0_0_30px_rgba(0,210,255,0.18)]">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mono text-[10px] tracking-widest text-cyan-300">
                  APPLY / CONNECT CAMPUS
                </div>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">
                  {selected.college_name}
                </h2>
                <p className="mt-1 font-mono text-xs text-slate-400">
                  {selected.program_type} · {selected.security_level} · {selected.city}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close consultation form"
                className="text-slate-400 hover:text-white"
              >
                <X />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormInput
                label="CONTACT NAME *"
                value={form.contact_name}
                onChange={(value) => setForm({ ...form, contact_name: value })}
              />
              <FormInput
                label="EMAIL *"
                type="email"
                value={form.email}
                onChange={(value) => setForm({ ...form, email: value })}
              />
              <FormInput
                label="PHONE"
                value={form.phone}
                onChange={(value) => setForm({ ...form, phone: value })}
              />
              <FormInput
                label="ROLE / DEPARTMENT"
                value={form.organization_role}
                onChange={(value) => setForm({ ...form, organization_role: value })}
              />
              <FormInput
                label="EXPECTED STUDENTS"
                type="number"
                value={form.student_count}
                onChange={(value) => setForm({ ...form, student_count: value })}
              />
              <label className="sm:col-span-2">
                <span className="mono mb-1 block text-[10px] text-slate-400">MESSAGE</span>
                <textarea
                  value={form.message}
                  onChange={(event) => setForm({ ...form, message: event.target.value })}
                  rows={3}
                  className="w-full border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-white outline-none focus:border-cyan-400"
                  placeholder="Tell us about your campus goal..."
                />
              </label>
            </div>
            <button
              onClick={submitConsultation}
              disabled={busy}
              className="mt-5 w-full bg-gradient-to-r from-blue-600 to-cyan-400 py-3 font-display text-xs font-bold tracking-wider text-slate-950 disabled:opacity-60"
            >
              {busy ? "SUBMITTING..." : "SUBMIT CONSULTATION"}
            </button>
            {!user && (
              <p className="mt-3 text-center font-mono text-xs text-slate-400">
                Please{" "}
                <Link to="/login" search={{ next: "/campus" }} className="text-cyan-300">
                  sign in
                </Link>{" "}
                to continue.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function unique(values: string[]) {
  return [...new Set(values)].sort();
}

function Filter({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={placeholder}
      className="border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-xs text-slate-300 outline-none focus:border-cyan-400"
    >
      <option value="All">All {placeholder === "City" ? "Cities" : `${placeholder}s`}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: number | string;
}) {
  return (
    <div className="border border-cyan-400/20 bg-[#0a0f1d] p-5">
      <Icon className="h-5 w-5 text-cyan-300" />
      <div className="mt-4 font-display text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-400">
        {label}
      </div>
    </div>
  );
}

function ProgramCard({ program, onApply }: { program: Program; onApply: () => void }) {
  const deadline = new Date(`${program.application_deadline}T00:00:00`).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "short", year: "numeric" },
  );
  return (
    <article className="border border-slate-700 bg-[#0a0f1d] p-5 transition hover:border-cyan-400/60 hover:shadow-[0_0_24px_rgba(0,210,255,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <span className="mono border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-[9px] tracking-widest text-cyan-300">
          {program.dynamic_tier}
        </span>
        <span className="mono text-[10px] text-slate-400">{program.security_level}</span>
      </div>
      <h2 className="mt-5 font-display text-xl font-semibold text-white">{program.college_name}</h2>
      <p className="mt-2 flex items-center gap-1 font-mono text-xs text-slate-400">
        <MapPin className="h-3.5 w-3.5 text-cyan-300" />
        {program.city}, {program.state} · {program.country}
      </p>
      <p className="mt-4 min-h-12 font-mono text-xs leading-relaxed text-slate-400">
        {program.description}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-700 py-4 font-mono text-[10px] text-slate-400">
        <span>
          <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-cyan-300" />
          {program.program_type}
        </span>
        <span>
          <Users className="mr-1 inline h-3.5 w-3.5 text-cyan-300" />
          {program.enrolled_students}/{program.seats} enrolled
        </span>
        <span className="col-span-2">
          <CalendarDays className="mr-1 inline h-3.5 w-3.5 text-cyan-300" />
          Apply by {deadline}
        </span>
      </div>
      <button
        onClick={onApply}
        className="mt-5 w-full border border-cyan-400/60 py-2.5 font-display text-xs font-bold tracking-wider text-cyan-300 transition hover:bg-cyan-400 hover:text-slate-950"
      >
        APPLY / CONNECT CAMPUS
      </button>
    </article>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label>
      <span className="mono mb-1 block text-[10px] text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-white outline-none focus:border-cyan-400"
      />
    </label>
  );
}
