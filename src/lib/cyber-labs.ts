import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Lab = Database["public"]["Tables"]["labs"]["Row"];
type Dataset = Database["public"]["Tables"]["datasets"]["Row"];
type LearningPath = Database["public"]["Tables"]["learning_paths"]["Row"];

export type CyberLabsCounts = {
  labs: number;
  datasets: number;
  learningPaths: number;
};

export async function getCyberLabsCounts(): Promise<CyberLabsCounts> {
  const [labs, datasets, learningPaths] = await Promise.all([
    supabase.from("labs").select("id", { count: "exact", head: true }),
    supabase.from("datasets").select("id", { count: "exact", head: true }),
    supabase.from("learning_paths").select("id", { count: "exact", head: true }),
  ]);

  const error = labs.error ?? datasets.error ?? learningPaths.error;
  if (error) throw error;

  return {
    labs: labs.count ?? 0,
    datasets: datasets.count ?? 0,
    learningPaths: learningPaths.count ?? 0,
  };
}

export async function listPublishedLabs(): Promise<Lab[]> {
  const { data, error } = await supabase
    .from("labs")
    .select("*")
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedLabBySlug(slug: string): Promise<Lab | null> {
  const { data, error } = await supabase
    .from("labs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listConnectedDatasets(): Promise<Dataset[]> {
  const { data, error } = await supabase
    .from("datasets")
    .select("*")
    .eq("status", "CONNECTED")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function listDatasetsForAdmin(): Promise<Dataset[]> {
  const { data, error } = await supabase
    .from("datasets")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getConnectedDataset(id: string): Promise<Dataset | null> {
  const { data, error } = await supabase
    .from("datasets")
    .select("*")
    .eq("id", id)
    .eq("status", "CONNECTED")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listPublishedLearningPaths(): Promise<LearningPath[]> {
  const { data, error } = await supabase
    .from("learning_paths")
    .select("*")
    .eq("status", "PUBLISHED")
    .order("name");
  if (error) throw error;
  return data ?? [];
}
