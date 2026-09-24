import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/colleges")({
  component: CollegesAdmin,
});

type College = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  type: string | null;
  website: string | null;
};

function CollegesAdmin() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ name: "", city: "", state: "", type: "", website: "" });

  const { data } = useQuery({
    queryKey: ["admin-colleges", q],
    queryFn: async () => {
      let query = supabase.from("colleges").select("*").order("name").limit(200);
      if (q) query = query.ilike("name", `%${q}%`);
      const { data } = await query;
      return (data ?? []) as College[];
    },
  });

  const add = async () => {
    if (!form.name) return toast.error("Name required");
    const { error } = await supabase.from("colleges").insert(form);
    if (error) return toast.error(error.message);
    setForm({ name: "", city: "", state: "", type: "", website: "" });
    toast.success("Added");
    qc.invalidateQueries({ queryKey: ["admin-colleges"] });
  };
  const del = async (id: string) => {
    if (!confirm("Delete college?")) return;
    const { error } = await supabase.from("colleges").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-colleges"] });
  };
  const bulkUpload = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const header = lines
      .shift()
      ?.toLowerCase()
      .split(",")
      .map((s) => s.trim());
    if (!header) return toast.error("Empty CSV");
    const idx = (k: string) => header.indexOf(k);
    const rows = lines
      .map((l) => {
        const cols = l.split(",").map((s) => s.trim());
        return {
          name: cols[idx("name")],
          city: cols[idx("city")] || null,
          state: cols[idx("state")] || null,
          type: cols[idx("type")] || null,
          website: cols[idx("website")] || null,
        };
      })
      .filter((r) => r.name);
    if (rows.length === 0) return toast.error("No valid rows (need `name` column)");
    const { error } = await supabase.from("colleges").insert(rows);
    if (error) return toast.error(error.message);
    toast.success(`Imported ${rows.length} colleges`);
    qc.invalidateQueries({ queryKey: ["admin-colleges"] });
  };

  return (
    <div>
      <h1 className="display text-3xl mb-6">Colleges Database</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-xl p-4 md:col-span-2">
          <div className="mono text-xs text-cyber mb-3">// ADD NEW</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Name*"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="col-span-2 bg-input/40 border border-border rounded px-3 py-2"
            />
            <input
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="bg-input/40 border border-border rounded px-3 py-2"
            />
            <input
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="bg-input/40 border border-border rounded px-3 py-2"
            />
            <input
              placeholder="Type (Government/Private/Deemed)"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="bg-input/40 border border-border rounded px-3 py-2"
            />
            <input
              placeholder="Website"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="bg-input/40 border border-border rounded px-3 py-2"
            />
          </div>
          <button
            onClick={add}
            className="mt-3 bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> ADD
          </button>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="mono text-xs text-cyber mb-3">// BULK CSV</div>
          <p className="text-xs text-muted-foreground mb-2">
            Columns: name,city,state,type,website
          </p>
          <label className="cursor-pointer flex items-center gap-2 border border-dashed border-primary/40 rounded-md p-3 hover:bg-primary/5">
            <Upload className="w-4 h-4 text-cyber" />
            <span className="text-sm">Choose CSV file</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && bulkUpload(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search colleges..."
        className="w-full bg-input/40 border border-border rounded px-3 py-2 mb-3"
      />

      <div className="glass rounded-xl overflow-hidden">
        {(data ?? []).map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-border/40 text-xs items-center"
          >
            <div className="col-span-5">
              <div className="font-semibold text-sm truncate">{c.name}</div>
            </div>
            <div className="col-span-2 truncate">{c.city}</div>
            <div className="col-span-2 truncate">{c.state}</div>
            <div className="col-span-2 mono text-[0.6rem] truncate">{c.type}</div>
            <div className="col-span-1 flex justify-end">
              <button onClick={() => del(c.id)} className="text-destructive p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
