import { VirtualFileSystem } from "../engine/filesystem/vfs";
import { LabTask } from "../engine/tasks/task-engine";

export interface LabProgressiveHint {
 level: 1 | 2 | 3;
 title: string;
 hint: string;
}

export interface LabAssessmentQuestion {
 id: string;
 question: string;
 options: string[];
 correct_index: number;
 explanation: string;
}

export interface LabNextRecommended {
 title: string;
 route: string;
 description: string;
}

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
 prerequisites?: string[];
 conceptual_intro?: string;
 dataset_description?: string;
 evidence_summary?: string;
 hints: string[];
 progressive_hints?: LabProgressiveHint[];
 tasks: LabTask[];
 flag: string;
 completion_criteria?: string[];
 final_assessment?: LabAssessmentQuestion[];
 next_recommended?: LabNextRecommended;
 setupFilesystem: () => VirtualFileSystem;
}
