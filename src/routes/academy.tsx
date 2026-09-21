import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FlaskConical,
  Lock,
  PlayCircle,
  ShieldCheck,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/academy")({
  head: () => ({
    meta: [
      { title: "NISQ Academy — Structured Cybersecurity Learning" },
      {
        name: "description",
        content: "Explore structured cybersecurity learning paths, practice labs and knowledge checks.",
      },
    ],
  }),
  component: Academy,
});

type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  level: string;
  tier: string;
  sort_order: number;
};
type Module = {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  notes_md: string | null;
  locked: boolean;
  tags: string[];
  difficulty: string;
  duration_minutes: number;
  practice_labs: string[];
  sort_order: number;
};
type Quiz = {
  id: string;
  module_id: string;
  question: string;
  options: string[];
  correct_option: number;
  explanation: string | null;
};
type Assignment = {
  id: string;
  module_id: string;
  title: string;
  instructions: string;
  task_type: string;
  expected_answer: string | null;
};
type Progress = {
  module_id: string;
  quiz_id: string | null;
  assignment_id: string | null;
  progress_type: string;
  completed: boolean;
  score: number | null;
};

function Academy() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["academy-structured", user?.id],
    queryFn: async () => {
      const [coursesResult, modulesResult, quizzesResult, assignmentsResult, progressResult] =
        await Promise.all([
          supabase.from("courses").select("id,slug,title,description,level,tier,sort_order").order("sort_order"),
          supabase.from("modules").select("id,course_id,slug,title,notes_md,locked,tags,difficulty,duration_minutes,practice_labs,sort_order").order("sort_order"),
          supabase.from("quizzes").select("id,module_id,question,options,correct_option,explanation").order("sort_order"),
          supabase.from("assignments").select("id,module_id,title,instructions,task_type,expected_answer").order("sort_order"),
          user
            ? supabase.from("user_course_progress").select("module_id,quiz_id,assignment_id,progress_type,completed,score").eq("user_id", user.id)
            : Promise.resolve({ data: [], error: null }),
        ]);
      const firstError = [coursesResult, modulesResult, quizzesResult, assignmentsResult, progressResult].find(
        (result) => result.error,
      );
      if (firstError?.error) throw new Error(firstError.error.message);
      return {
        courses: (coursesResult.data ?? []) as Course[],
        modules: (modulesResult.data ?? []) as Module[],
        quizzes: (quizzesResult.data ?? []).map((quiz) => ({
          ...quiz,
          options: jsonStrings(quiz.options),
        })) as Quiz[],
        assignments: (assignmentsResult.data ?? []) as Assignment[],
        progress: (progressResult.data ?? []) as Progress[],
      };
    },
  });

  const courses = data?.courses ?? [];
  const activeCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0];
  const modules = useMemo(
    () => (data?.modules ?? []).filter((module) => module.course_id === activeCourse?.id),
    [activeCourse?.id, data?.modules],
  );
  const activeModule = modules.find((module) => module.id === selectedModuleId) ?? modules[0];
  const quizzes = (data?.quizzes ?? []).filter((quiz) => quiz.module_id === activeModule?.id);
  const assignments = (data?.assignments ?? []).filter((assignment) => assignment.module_id === activeModule?.id);
  const progress = data?.progress ?? [];
  const completedModules = new Set(progress.filter((item) => item.progress_type === "module" && item.completed).map((item) => item.module_id));
  const completedQuizzes = new Set(progress.filter((item) => item.progress_type === "quiz" && item.completed).map((item) => item.quiz_id));
  const courseCompleted = modules.filter((module) => completedModules.has(module.id)).length;
  const courseQuizTotal = quizzesForModules(data?.quizzes ?? [], modules).length;
  const courseQuizCompleted = modules.reduce(
    (total, module) => total + (data?.quizzes ?? []).filter((quiz) => quiz.module_id === module.id && completedQuizzes.has(quiz.id)).length,
    0,
  );

  const requireAuth = () => {
    if (user) return true;
    void navigate({ to: "/login", search: { next: "/academy" } });
    return false;
  };

  const saveProgress = async (payload: {
    module_id: string;
    progress_type: "module" | "quiz" | "assignment";
    quiz_id?: string;
    assignment_id?: string;
    completed: boolean;
    score?: number;
    response?: string;
  }) => {
    if (!user || !activeCourse) return;
    setSaving(payload.quiz_id ?? payload.assignment_id ?? payload.module_id);
    const query = supabase.from("user_course_progress").select("id").eq("user_id", user.id).eq("module_id", payload.module_id).eq("progress_type", payload.progress_type);
    if (payload.quiz_id) query.eq("quiz_id", payload.quiz_id);
    if (payload.assignment_id) query.eq("assignment_id", payload.assignment_id);
    const { data: existing, error: readError } = await query.maybeSingle();
    if (readError) {
      toast.error(readError.message);
      setSaving(null);
      return;
    }
    const values = {
      user_id: user.id,
      course_id: activeCourse.id,
      module_id: payload.module_id,
      quiz_id: payload.quiz_id ?? null,
      assignment_id: payload.assignment_id ?? null,
      progress_type: payload.progress_type,
      completed: payload.completed,
      score: payload.score ?? null,
      response: payload.response ?? null,
      completed_at: payload.completed ? new Date().toISOString() : null,
    };
    const result = existing
      ? await supabase.from("user_course_progress").update(values).eq("id", existing.id)
      : await supabase.from("user_course_progress").insert(values);
    setSaving(null);
    if (result.error) {
      toast.error(`Unable to save progress: ${result.error.message}`);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["academy-structured"] });
    toast.success(payload.progress_type === "module" ? "Module completed." : "Knowledge check completed.");
  };

  if (isLoading) return <main className="pt-24 px-4">Loading academy pathways…</main>;
  if (error) return <main className="pt-24 px-4 text-center text-destructive">{(error as Error).message}</main>;

  return (
    <main className="min-h-screen bg-[#030712] px-4 pb-20 pt-28 text-slate-200 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <div className="mono text-xs tracking-[0.18em] text-cyan-300">// VANGUARD ELITE ACADEMY</div>
          <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-6xl">MASTER THE CYBER FRONTIER</h1>
          <p className="mt-4 max-w-3xl font-mono text-sm leading-relaxed text-slate-400">Structured learning paths inspired by modern cyber rooms and practical data-learning tracks. Read, practise, answer and build evidence of progress.</p>
        </header>

        <section className="mb-8 grid gap-4 lg:grid-cols-3">
          {courses.map((course) => {
            const courseModules = (data?.modules ?? []).filter((module) => module.course_id === course.id);
            const done = courseModules.filter((module) => completedModules.has(module.id)).length;
            const percent = courseModules.length ? Math.round((done / courseModules.length) * 100) : 0;
            return (
              <button key={course.id} onClick={() => { setSelectedCourseId(course.id); setSelectedModuleId(null); }} className={`text-left border p-5 transition ${activeCourse?.id === course.id ? "border-cyan-400 bg-cyan-400/10" : "border-slate-700 bg-[#0a0f1d] hover:border-cyan-400/60"}`}>
                <div className="flex items-center justify-between"><span className="mono text-[10px] tracking-widest text-cyan-300">{course.level} · {course.tier}</span><BookOpen className="h-5 w-5 text-cyan-300" /></div>
                <h2 className="mt-4 font-display text-xl font-semibold text-white">{course.title}</h2>
                <p className="mt-2 min-h-10 text-xs leading-relaxed text-slate-400">{course.description}</p>
                <ProgressBar value={percent} label={`${done}/${courseModules.length} modules`} />
              </button>
            );
          })}
        </section>

        {activeCourse && (
          <section className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <div className="mb-4 flex items-end justify-between"><div><div className="mono text-[10px] tracking-widest text-cyan-300">ROOM MAP</div><h2 className="mt-2 font-display text-2xl font-semibold text-white">{activeCourse.title}</h2></div><span className="font-mono text-xs text-slate-400">{courseCompleted}/{modules.length} complete</span></div>
              <ProgressBar value={modules.length ? Math.round((courseCompleted / modules.length) * 100) : 0} label={`${courseQuizCompleted}/${courseQuizTotal} quiz checks passed`} />
              <div className="mt-5 space-y-3">
                {modules.map((module, index) => {
                  const complete = completedModules.has(module.id);
                  return <button key={module.id} onClick={() => setSelectedModuleId(module.id)} className={`flex w-full items-center gap-4 border p-4 text-left transition ${activeModule?.id === module.id ? "border-cyan-400 bg-cyan-400/10" : "border-slate-700 bg-[#0a0f1d] hover:border-cyan-400/50"}`}><div className="font-mono text-xs text-slate-500">{String(index + 1).padStart(2, "0")}</div><div className="min-w-0 flex-1"><div className="truncate font-display text-base font-semibold text-white">{module.title}</div><div className="mt-1 flex flex-wrap gap-2 font-mono text-[9px] text-slate-400"><span>{module.difficulty}</span><span>·</span><span>{module.duration_minutes} min</span></div></div>{module.locked ? <Lock className="h-4 w-4 text-slate-500" /> : complete ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <PlayCircle className="h-5 w-5 text-cyan-300" />}</button>;
                })}
              </div>
            </div>

            {activeModule ? (
              <div className="border border-slate-700 bg-[#0a0f1d] p-5 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="mono text-[10px] tracking-widest text-cyan-300">ROOM {String(modules.indexOf(activeModule) + 1).padStart(2, "0")} · {activeModule.difficulty.toUpperCase()}</div><h2 className="mt-2 font-display text-3xl font-semibold text-white">{activeModule.title}</h2></div><div className="flex items-center gap-1 font-mono text-xs text-slate-400"><Clock3 className="h-4 w-4 text-cyan-300" />{activeModule.duration_minutes} min</div></div>
                <div className="mt-4 flex flex-wrap gap-2">{activeModule.tags.map((tag) => <span key={tag} className="border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 font-mono text-[9px] text-cyan-300">{tag}</span>)}</div>
                <div className="mt-7 space-y-6">
                  <Step icon={BookOpen} title="Read the room" body={activeModule.notes_md ?? "Review the module notes before moving to the tasks."} />
                  <Step icon={Target} title="Walkthrough tasks" body={assignments.filter((assignment) => assignment.task_type === "walkthrough").map((assignment) => assignment.instructions).join(" ") || "Follow the guided practice lab and record the defensive decision you would make."} />
                  <Step icon={FlaskConical} title="Associated practice labs" body={activeModule.practice_labs.join(" · ") || "Practice lab pathway will be added to this room soon."} />
                  {assignments.filter((assignment) => assignment.task_type === "read_and_answer").map((assignment) => <AnswerTask key={assignment.id} assignment={assignment} moduleId={activeModule.id} disabled={saving === assignment.id} onSubmit={(response) => saveProgress({ module_id: activeModule.id, assignment_id: assignment.id, progress_type: "assignment", completed: true, score: 100, response })} />)}
                  {quizzes.map((quiz) => <QuizTask key={quiz.id} quiz={quiz} selected={answers[quiz.id]} completed={completedQuizzes.has(quiz.id)} disabled={saving === quiz.id} onAnswer={(option) => { if (!requireAuth()) return; setAnswers({ ...answers, [quiz.id]: option }); void saveProgress({ module_id: activeModule.id, quiz_id: quiz.id, progress_type: "quiz", completed: option === quiz.correct_option, score: option === quiz.correct_option ? 100 : 0, response: String(option) }); }} />)}
                </div>
                <button onClick={() => { if (requireAuth()) void saveProgress({ module_id: activeModule.id, progress_type: "module", completed: true, score: 100 }); }} disabled={saving === activeModule.id || completedModules.has(activeModule.id)} className="mt-8 flex w-full items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-400 py-3 font-display text-xs font-bold tracking-wider text-slate-950 disabled:opacity-50">{completedModules.has(activeModule.id) ? "MODULE COMPLETE" : "MARK ROOM COMPLETE"} <ShieldCheck className="h-4 w-4" /></button>
              </div>
            ) : <div className="flex min-h-80 items-center justify-center border border-dashed border-slate-700 font-mono text-sm text-slate-400">Select a room to begin.</div>}
          </section>
        )}
        {!user && <p className="mt-8 text-center font-mono text-xs text-slate-400">Progress is saved after <Link to="/login" search={{ next: "/academy" }} className="text-cyan-300">sign in</Link>.</p>}
      </div>
    </main>
  );
}

function quizzesForModules(quizzes: Quiz[], modules: Module[]) {
  const moduleIds = new Set(modules.map((module) => module.id));
  return quizzes.filter((quiz) => moduleIds.has(quiz.module_id));
}

function jsonStrings(value: Json): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return <div className="mt-5"><div className="mb-2 flex justify-between font-mono text-[10px] text-slate-400"><span>{label}</span><span>{value}%</span></div><div className="h-1.5 overflow-hidden bg-slate-800"><div className="h-full bg-cyan-400 transition-all" style={{ width: `${value}%` }} /></div></div>;
}

function Step({ icon: Icon, title, body }: { icon: typeof BookOpen; title: string; body: string }) {
  return <div className="border-l-2 border-cyan-400/50 pl-4"><div className="flex items-center gap-2 font-display text-sm font-semibold text-white"><Icon className="h-4 w-4 text-cyan-300" />{title}</div><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-400">{body}</p></div>;
}

function QuizTask({ quiz, selected, completed, disabled, onAnswer }: { quiz: Quiz; selected?: number; completed: boolean; disabled: boolean; onAnswer: (option: number) => void }) {
  return <div className="border border-slate-700 bg-slate-950/60 p-4"><div className="mb-3 flex items-center justify-between"><span className="mono text-[10px] tracking-widest text-cyan-300">KNOWLEDGE CHECK</span>{completed && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}</div><p className="text-sm font-semibold text-white">{quiz.question}</p><div className="mt-3 grid gap-2">{quiz.options.map((option, index) => <button key={option} onClick={() => onAnswer(index)} disabled={disabled || completed} className={`border px-3 py-2 text-left text-xs transition ${selected === index ? index === quiz.correct_option && completed ? "border-emerald-400 bg-emerald-400/10 text-emerald-300" : "border-cyan-400 bg-cyan-400/10 text-cyan-200" : "border-slate-700 text-slate-400 hover:border-cyan-400/50"}`}>{option}</button>)}</div>{completed && quiz.explanation && <p className="mt-3 font-mono text-[10px] text-emerald-300">→ {quiz.explanation}</p>}</div>;
}

function AnswerTask({ assignment, moduleId: _moduleId, disabled, onSubmit }: { assignment: Assignment; moduleId: string; disabled: boolean; onSubmit: (response: string) => void }) {
  const [response, setResponse] = useState("");
  const submit = () => {
    if (!response.trim()) return;
    if (assignment.expected_answer && !response.toLowerCase().includes(assignment.expected_answer.toLowerCase())) {
      toast.error("Not quite. Re-read the room and try the expected keyword.");
      return;
    }
    onSubmit(response);
  };
  return <div className="border border-slate-700 bg-slate-950/60 p-4"><div className="mono text-[10px] tracking-widest text-cyan-300">READ &amp; ANSWER</div><p className="mt-2 text-sm font-semibold text-white">{assignment.title}</p><p className="mt-2 text-xs leading-relaxed text-slate-400">{assignment.instructions}</p><div className="mt-3 flex gap-2"><input value={response} onChange={(event) => setResponse(event.target.value)} placeholder="Type your answer..." className="min-w-0 flex-1 border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-white outline-none focus:border-cyan-400" /><button onClick={submit} disabled={disabled || !response.trim()} className="border border-cyan-400 px-3 py-2 font-mono text-[10px] text-cyan-300 disabled:opacity-50">SAVE</button></div></div>;
}
