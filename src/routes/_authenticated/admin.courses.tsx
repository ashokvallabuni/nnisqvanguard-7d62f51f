import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/common/PageHeader";
import { BookOpen, Edit, Trash2, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  component: AdminCoursesPage,
});

function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

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
