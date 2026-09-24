import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/content")({ component: ContentAdmin });

type Item = {
  id: string;
  section_name: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
};

function ContentAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-content"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("*").order("section_name");
      return (data ?? []) as Item[];
    },
  });
  const [edits, setEdits] = useState<Record<string, { title: string; description: string }>>({});

  useEffect(() => {
    if (data) {
      const e: Record<string, { title: string; description: string }> = {};
      data.forEach((d) => {
        e[d.id] = { title: d.title ?? "", description: d.description ?? "" };
      });
      setEdits(e);
    }
  }, [data]);

  const save = async (id: string) => {
    const patch = edits[id];
    const { error } = await supabase
      .from("site_content")
      .update({
        title: patch.title,
        description: patch.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["site_content"] });
    qc.invalidateQueries({ queryKey: ["admin-content"] });
  };

  return (
    <div>
      <h1 className="display text-3xl mb-6">Website Content (CMS)</h1>
      <div className="space-y-4">
        {(data ?? []).map((s) => (
          <div key={s.id} className="glass rounded-xl p-5">
            <div className="mono text-xs text-cyber mb-3">// {s.section_name.toUpperCase()}</div>
            <input
              value={edits[s.id]?.title ?? ""}
              onChange={(e) =>
                setEdits({ ...edits, [s.id]: { ...edits[s.id], title: e.target.value } })
              }
              placeholder="Title"
              className="w-full bg-input/40 border border-border rounded-md px-3 py-2 mb-2"
            />
            <textarea
              value={edits[s.id]?.description ?? ""}
              onChange={(e) =>
                setEdits({ ...edits, [s.id]: { ...edits[s.id], description: e.target.value } })
              }
              placeholder="Description"
              rows={3}
              className="w-full bg-input/40 border border-border rounded-md px-3 py-2 mb-3"
            />
            <button
              onClick={() => save(s.id)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold mono text-xs"
            >
              SAVE
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
