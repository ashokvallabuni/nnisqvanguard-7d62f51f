import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/common/PageHeader";
import {
  BookOpen,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  Loader2,
  Database,
  RefreshCw,
  Search,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  getIndexingStats,
  refreshKnowledgeIndex,
  searchCourseKnowledge,
  type CourseIndexingStats,
  type KnowledgeSearchResult,
} from "@/lib/rag/course-knowledge";

export const Route = createFileRoute("/_authenticated/admin/courses")({
 component: AdminCoursesPage,
});

function AdminCoursesPage() {
 const queryClient = useQueryClient();
 const [isGenerating, setIsGenerating] = useState<string | null>(null);
 const [indexingStats, setIndexingStats] = useState<CourseIndexingStats>(() => getIndexingStats());
 const [isRefreshingIndex, setIsRefreshingIndex] = useState(false);
 const [testQuery, setTestQuery] = useState("");
 const [testResults, setTestResults] = useState<KnowledgeSearchResult[]>([]);
 const [hasSearched, setHasSearched] = useState(false);
 const [showTester, setShowTester] = useState(false);

 const handleRefreshIndex = () => {
 setIsRefreshingIndex(true);
 try {
 const stats = refreshKnowledgeIndex();
 setIndexingStats(stats);
 toast.success(
 `IVVAB Knowledge Index synchronized! (${stats.totalChunks} chunks indexed across ${stats.totalCourses} courses)`,
 );
 } catch (err: any) {
 toast.error(`Failed to refresh knowledge index: ${err.message}`);
 } finally {
 setIsRefreshingIndex(false);
 }
 };

 const handleRunTestQuery = (e: React.FormEvent) => {
 e.preventDefault();
 if (!testQuery.trim()) return;
 const results = searchCourseKnowledge(testQuery.trim(), { limit: 4 });
 setTestResults(results);
 setHasSearched(true);
 };

 const { data: courses, isLoading } = useQuery({
 queryKey: ["admin-courses"],
 queryFn: async () => {
 const { data, error } = await supabase.from("courses").select("*").order("sort_order");
 if (error) throw error;
 return data ?? [];
 },
 });

 const updateStatusMutation = useMutation({
 mutationFn: async ({
 id,
 status,
 }: {
 id: string;
 status: "PUBLISHED" | "DRAFT" | "LOCKED" | "ARCHIVED";
 }) => {
 const { error } = await supabase.from("courses").update({ status }).eq("id", id);
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
 queryClient.invalidateQueries({ queryKey: ["academy-courses"] });
 toast.success("Course status updated successfully");
 },
 onError: (error) => {
 toast.error(error.message || "Failed to update course status");
 },
 });

 const handleGenerateContent = async (courseId: string, courseSlug: string) => {
 try {
 setIsGenerating(courseId);
 toast.info(`Generating upgraded content for ${courseSlug}... This may take a minute.`);
 
 // Fetch all modules for this course
 const { data: modules, error: modErr } = await supabase
 .from("modules")
 .select("*")
 .eq("course_id", courseId);
 
 if (modErr || !modules || modules.length === 0) {
 toast.error("No modules found for this course.");
 return;
 }

 // Generate content for each module
 let successCount = 0;
 for (const mod of modules) {
 const res = await fetch("/api/generate-lesson", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 courseSlug: courseSlug,
 moduleSlug: mod.slug,
 courseTitle: courseSlug, 
 moduleTitle: mod.title,
 currentContent: mod.notes_md
 })
 });
 
 if (res.ok) successCount++;
 }
 
 toast.success(`Successfully upgraded ${successCount}/${modules.length} lessons!`);
 } catch (e: any) {
 toast.error(`Error: ${e.message}`);
 } finally {
 setIsGenerating(null);
 }
 };

 if (isLoading) {
 return <div className="text-muted-foreground p-8">Loading curriculum...</div>;
 }

 return (
 <div className="space-y-6 max-w-5xl">
 <div className="flex items-center justify-between">
 <PageHeader
 title="Curriculum Manager"
 subtitle="Manage courses, modules, and lessons. Control what is visible to learners."
 badge="Admin Console"
 />
 <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold text-sm">
 + New Course
 </button>
 </div>

 {/* IVVAB AI Course Knowledge & RAG Index Panel */}
 <div className="glass rounded-xl p-5 border border-primary/20 space-y-4 bg-primary/5">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <div className="p-2.5 rounded-lg bg-primary/15 text-cyber border border-primary/30">
 <Database className="w-5 h-5 text-cyber" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="font-semibold text-base text-foreground">IVVAB AI Knowledge Index & RAG Engine</h3>
 <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.65rem] font-mono font-medium bg-success/15 text-success border border-success/30">
 <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
 RAG ENGINE READY
 </span>
 </div>
 <p className="text-xs text-muted-foreground mt-0.5">
 Indexes all actual Academy courses, lessons, lab virtual filesystem datasets, and glossaries for grounded tutoring.
 </p>
 </div>
 </div>
 
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setShowTester(!showTester)}
 className="px-3 py-1.5 rounded-md border border-border bg-card/60 hover:bg-card text-foreground font-mono text-xs flex items-center gap-1.5 transition-colors"
 >
 <Search className="w-3.5 h-3.5 text-cyber" />
 {showTester ? "Hide Query Tester" : "Test Retrieval"}
 {showTester ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
 </button>
 <button
 type="button"
 onClick={handleRefreshIndex}
 disabled={isRefreshingIndex}
 className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
 >
 <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingIndex ? "animate-spin" : ""}`} />
 Refresh Index
 </button>
 </div>
 </div>

 {/* Telemetry Metrics Grid */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-border/60">
 <div className="p-3 rounded-lg bg-card/60 border border-border/60">
 <div className="text-[0.65rem] font-mono text-muted-foreground uppercase">Total Courses</div>
 <div className="text-lg font-bold font-mono text-cyber mt-0.5">{indexingStats.totalCourses}</div>
 <div className="text-[0.6rem] text-muted-foreground">Available & roadmap</div>
 </div>
 <div className="p-3 rounded-lg bg-card/60 border border-border/60">
 <div className="text-[0.65rem] font-mono text-muted-foreground uppercase">Modules & Lessons</div>
 <div className="text-lg font-bold font-mono text-foreground mt-0.5">{indexingStats.totalModules}</div>
 <div className="text-[0.6rem] text-muted-foreground">Syllabus units</div>
 </div>
 <div className="p-3 rounded-lg bg-card/60 border border-border/60">
 <div className="text-[0.65rem] font-mono text-muted-foreground uppercase">Practical Labs</div>
 <div className="text-lg font-bold font-mono text-cyber mt-0.5">{indexingStats.totalLabs}</div>
 <div className="text-[0.6rem] text-muted-foreground">Virtual environments</div>
 </div>
 <div className="p-3 rounded-lg bg-card/60 border border-border/60">
 <div className="text-[0.65rem] font-mono text-muted-foreground uppercase">Searchable Chunks</div>
 <div className="text-lg font-bold font-mono text-foreground mt-0.5">{indexingStats.totalChunks}</div>
 <div className="text-[0.6rem] text-muted-foreground">BM25 / vector nodes</div>
 </div>
 <div className="p-3 rounded-lg bg-card/60 border border-border/60">
 <div className="text-[0.65rem] font-mono text-muted-foreground uppercase">Glossary Terms</div>
 <div className="text-lg font-bold font-mono text-cyber mt-0.5">{indexingStats.totalGlossaryTerms}</div>
 <div className="text-[0.6rem] text-muted-foreground">Cyber definitions</div>
 </div>
 <div className="p-3 rounded-lg bg-card/60 border border-border/60">
 <div className="text-[0.65rem] font-mono text-muted-foreground uppercase">Career Paths</div>
 <div className="text-lg font-bold font-mono text-foreground mt-0.5">{indexingStats.totalPaths}</div>
 <div className="text-[0.6rem] text-muted-foreground">Mapped sequences</div>
 </div>
 </div>

 {/* Index Security & Sync Info */}
 <div className="flex flex-wrap items-center justify-between text-[0.7rem] font-mono text-muted-foreground pt-1 px-1">
 <div className="flex items-center gap-3">
 <span className="flex items-center gap-1 text-success">
 <ShieldCheck className="w-3.5 h-3.5" /> Zero Flag Leakage Enforced
 </span>
 <span>•</span>
 <span>BM25 + TF-IDF Weighted Ranking</span>
 </div>
 <div>
 Last Synchronized: <span className="text-foreground">{new Date(indexingStats.indexedAt).toLocaleTimeString()}</span>
 </div>
 </div>

 {/* Optional Retrieval Tester */}
 {showTester && (
 <div className="pt-3 border-t border-border/60 space-y-3">
 <form onSubmit={handleRunTestQuery} className="flex gap-2">
 <div className="relative flex-1">
 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
 <input
 type="text"
 value={testQuery}
 onChange={(e) => setTestQuery(e.target.value)}
 placeholder="Enter a test query (e.g., 'SSH brute force auth.log', 'DNS tunneling', 'Volatility pslist')..."
 className="w-full bg-input/40 border border-border rounded-md pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-primary text-foreground"
 />
 </div>
 <button
 type="submit"
 className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-mono font-semibold hover:bg-primary/90"
 >
 Test Query
 </button>
 </form>

 {hasSearched && (
 <div className="space-y-2 mt-2">
 <div className="text-[0.7rem] font-mono text-muted-foreground flex items-center justify-between">
 <span>Found {testResults.length} matching knowledge chunk(s):</span>
 <span>Min BM25 score: 2.0</span>
 </div>
 {testResults.length === 0 ? (
 <div className="p-3 rounded-lg bg-card/40 border border-border text-center text-xs text-muted-foreground font-mono">
 No matching course chunks found. IVVAB AI will honestly indicate no direct curriculum match.
 </div>
 ) : (
 <div className="space-y-2">
 {testResults.map((res, i) => (
 <div key={res.chunk.id || i} className="p-3 rounded-lg bg-card/50 border border-border text-xs space-y-1.5">
 <div className="flex items-center justify-between">
 <span className="font-semibold text-cyber">{res.chunk.courseTitle} {res.chunk.moduleTitle ? `› ${res.chunk.moduleTitle}` : ""}</span>
 <span className="font-mono text-[0.65rem] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
 Relevance: {res.score.toFixed(1)}
 </span>
 </div>
 <div className="text-[0.7rem] text-muted-foreground font-mono">{res.chunk.sectionTitle} • Route: {res.chunk.verifiedRoute}</div>
 <p className="text-muted-foreground text-[0.75rem] line-clamp-2">{res.chunk.content}</p>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 )}
 </div>

 <div className="grid gap-4">
 {courses?.map((course) => (
 <div
 key={course.id}
 className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
 >
 <div className="flex items-start gap-4">
 <div className="p-3 bg-primary/10 rounded-lg text-primary mt-1">
 <BookOpen className="w-5 h-5" />
 </div>
 <div>
 <h3 className="font-semibold text-lg text-foreground">{course.title}</h3>
 <p className="text-sm text-muted-foreground max-w-xl line-clamp-1">
 {course.description}
 </p>
 <div className="flex items-center gap-3 mt-2 text-xs font-mono text-muted-foreground">
 <span className="uppercase">{course.level}</span>
 <span>•</span>
 <span className="uppercase">{course.tier}</span>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-3 md:ml-auto shrink-0">
 <div className="flex flex-col gap-1 mr-4">
 <label className="text-[0.6rem] uppercase tracking-wider text-muted-foreground font-mono">
 Visibility Status
 </label>
 <select
 className={`text-xs font-semibold px-2 py-1.5 rounded-md border appearance-none outline-none ${
 course.status === "PUBLISHED"
 ? "bg-success/10 text-success border-success/30"
 : "bg-warning/10 text-warning border-warning/30"
 }`}
 value={course.status || "DRAFT"}
 onChange={(e) =>
 updateStatusMutation.mutate({ id: course.id, status: e.target.value as any })
 }
 disabled={updateStatusMutation.isPending}
 >
 <option value="PUBLISHED">PUBLISHED</option>
 <option value="DRAFT">DRAFT</option>
 <option value="LOCKED">LOCKED</option>
 <option value="ARCHIVED">ARCHIVED</option>
 </select>
 </div>

 <button 
 onClick={() => handleGenerateContent(course.id, course.slug)}
 disabled={isGenerating === course.id}
 title="Upgrade Content via Gemini"
 className="p-2 border border-border rounded-md text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
 >
 {isGenerating === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
 </button>
 <button className="p-2 border border-border rounded-md text-muted-foreground hover:bg-muted transition-colors">
 <Edit className="w-4 h-4" />
 </button>
 <button className="p-2 border border-destructive/30 rounded-md text-destructive hover:bg-destructive/10 transition-colors">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 ))}
 {courses?.length === 0 && (
 <div className="text-center p-12 border border-dashed border-border rounded-xl text-muted-foreground">
 No courses found. Create one to get started.
 </div>
 )}
 </div>
 </div>
 );
}
