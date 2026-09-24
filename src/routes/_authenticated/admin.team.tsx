import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/team")({ component: TeamAdmin });

type Member = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  display_order: number;
};

function TeamAdmin() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", role: "", bio: "", file: null as File | null });
  const [busy, setBusy] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-team"],
    queryFn: async () => {
      const { data } = await supabase.from("team_members").select("*").order("display_order");
      return (data ?? []) as Member[];
    },
  });

  const add = async () => {
    if (!form.name || !form.role) return toast.error("Name & role required");
    setBusy(true);
    let image_url: string | null = null;
    if (form.file) {
      const ext = form.file.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("team")
        .upload(path, form.file, { contentType: form.file.type });
      if (error) {
        setBusy(false);
        return toast.error(error.message);
      }
      const { data: s } = await supabase.storage
        .from("team")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      image_url = s?.signedUrl ?? null;
    }
    const { error } = await supabase
      .from("team_members")
      .insert({ name: form.name, role: form.role, bio: form.bio || null, image_url });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Added");
    setForm({ name: "", role: "", bio: "", file: null });
    qc.invalidateQueries({ queryKey: ["admin-team"] });
    qc.invalidateQueries({ queryKey: ["team"] });
  };
  const del = async (id: string) => {
    if (!confirm("Delete this member?")) return;
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-team"] });
    qc.invalidateQueries({ queryKey: ["team"] });
  };

  return (
    <div>
      <h1 className="display text-3xl mb-6">Team Members</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5 space-y-3">
          <div className="mono text-xs text-cyber">// ADD NEW MEMBER</div>
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-input/40 border border-border rounded-md px-3 py-2"
          />
          <input
            placeholder="Role / Title"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full bg-input/40 border border-border rounded-md px-3 py-2"
          />
          <textarea
            placeholder="Bio (optional)"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full bg-input/40 border border-border rounded-md px-3 py-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })}
            className="w-full text-xs"
          />
          <button
            onClick={add}
            disabled={busy}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> {busy ? "SAVING..." : "ADD MEMBER"}
          </button>
        </div>
        <div className="space-y-2">
          {(data ?? []).map((m) => (
            <div key={m.id} className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 overflow-hidden">
                {m.image_url && (
                  <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{m.name}</div>
                <div className="mono text-[0.6rem] text-cyber truncate">{m.role}</div>
              </div>
              <button onClick={() => del(m.id)} className="p-2 text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
