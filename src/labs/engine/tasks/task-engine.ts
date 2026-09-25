import { CommandContext } from "../commands";

export interface LabTask {
  id: string;
  title: string;
  description: string;
  command_hint?: string;
  validate: (ctx: CommandContext, lastCmd: string) => boolean;
}

export class TaskEngine {
  tasks: LabTask[];
  completedIds: Set<string>;

  constructor(tasks: LabTask[]) {
    this.tasks = tasks;
    this.completedIds = new Set();
  }

  evaluate(ctx: CommandContext, lastCmd: string): string[] {
    const newlyCompleted: string[] = [];
    for (const task of this.tasks) {
      if (!this.completedIds.has(task.id)) {
        try {
          if (task.validate(ctx, lastCmd)) {
            this.completedIds.add(task.id);
            newlyCompleted.push(task.id);
          }
        } catch (e) {
          // ignore validation errors safely
        }
      }
    }
    return newlyCompleted;
  }

  isAllCompleted(): boolean {
    return this.tasks.length > 0 && this.completedIds.size === this.tasks.length;
  }
}
