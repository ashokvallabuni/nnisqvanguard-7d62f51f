import { VirtualFileSystem } from "../engine/filesystem/vfs";
import { LabTask } from "../engine/tasks/task-engine";

export interface LabDefinition {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  category: string;
  description: string;
  estimated_minutes: number;
  reward_points: number;
  learning_objectives: string[];
  hints: string[];
  tasks: LabTask[];
  flag: string;
  setupFilesystem: () => VirtualFileSystem;
}
