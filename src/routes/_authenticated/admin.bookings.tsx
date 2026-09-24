import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  component: BookingsAdmin,
});

function BookingsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, colleges(name, city, state)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const update = async (
    id: string,
    patch: { status?: string; scheduled_at?: string | null; notes?: string | null },
  ) => {
    const { error } = await supabase.from("bookings").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["admin-bookings"] });
  };

  return (
    <div>
      <h1 className="display text-3xl mb-6">Bookings</h1>
      <div className="glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border mono text-[0.55rem] text-muted-foreground">
          <div className="col-span-3">COLLEGE</div>
          <div className="col-span-2">CONTACT</div>
          <div className="col-span-2">PROGRAM</div>
          <div className="col-span-2">DATE</div>
          <div className="col-span-1">STATUS</div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>
        {!data || data.length === 0 ? (
          <div className="p-8 text-muted-foreground text-sm">No bookings.</div>
        ) : (
          data.map((b) => {
            const college = (
              b as { colleges?: { name?: string; city?: string; state?: string } | null }
            ).colleges;
            return (
              <div
                key={b.id as string}
                className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border/40 text-xs items-center"
              >
                <div className="col-span-3">
                  <div className="font-semibold text-sm">{college?.name ?? "—"}</div>
                  <div className="mono text-[0.55rem] text-muted-foreground">
                    {college?.city}, {college?.state}
                  </div>
                </div>
                <div className="col-span-2">
                  <div>{b.contact_person as string}</div>
                  <div className="mono text-[0.55rem] text-muted-foreground truncate">
                    {b.email as string}
                  </div>
                </div>
                <div className="col-span-2">
                  <div>{b.program_type as string}</div>
                  <div className="mono text-[0.55rem] text-muted-foreground truncate">
                    {b.topic as string}
                  </div>
                </div>
                <div className="col-span-2 mono text-[0.65rem]">
                  {(b.preferred_date as string) ?? "—"}
                </div>
                <div className="col-span-1 mono text-[0.55rem]">
                  {(b.status as string).toUpperCase()}
                </div>
                <div className="col-span-2 flex gap-1 justify-end flex-wrap">
                  <button
                    onClick={() => update(b.id as string, { status: "approved" })}
                    className="mono text-[0.55rem] px-2 py-1 rounded border border-success/40 text-success"
                  >
                    APPROVE
                  </button>
                  <button
                    onClick={() => update(b.id as string, { status: "rejected" })}
                    className="mono text-[0.55rem] px-2 py-1 rounded border border-destructive/40 text-destructive"
                  >
                    REJECT
                  </button>
                  <button
                    onClick={() => {
                      const d = prompt("Schedule date (YYYY-MM-DD)");
                      if (d) update(b.id as string, { scheduled_at: d, status: "approved" });
                    }}
                    className="mono text-[0.55rem] px-2 py-1 rounded border"
                  >
                    SCHEDULE
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
