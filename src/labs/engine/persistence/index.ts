import { VirtualFileSystem } from "../filesystem/vfs";

const VFS_KEY_PREFIX = "ivvab_vfs_";
const PROGRESS_KEY_PREFIX = "ivvab_progress_";

export function saveVfsState(labId: string, vfs: VirtualFileSystem) {
  try {
    localStorage.setItem(VFS_KEY_PREFIX + labId, JSON.stringify(vfs.root));
  } catch (e) {
    console.error("Failed to save VFS state", e);
  }
}

export function loadVfsState(labId: string): VirtualFileSystem | null {
  try {
    const data = localStorage.getItem(VFS_KEY_PREFIX + labId);
    if (data) {
      return new VirtualFileSystem(JSON.parse(data));
    }
  } catch (e) {
    console.error("Failed to load VFS state", e);
  }
  return null;
}

export function clearVfsState(labId: string) {
  localStorage.removeItem(VFS_KEY_PREFIX + labId);
}

export interface LocalLabProgress {
  completed: boolean;
  tasksCompleted: number;
  points: number;
  completedTaskIds: string[];
}

export function saveLocalProgress(labId: string, progress: LocalLabProgress) {
  try {
    localStorage.setItem(PROGRESS_KEY_PREFIX + labId, JSON.stringify(progress));
  } catch (e) {
    console.error("Failed to save progress", e);
  }
}

export function loadLocalProgress(labId: string): LocalLabProgress | null {
  try {
    const data = localStorage.getItem(PROGRESS_KEY_PREFIX + labId);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load progress", e);
  }
  return null;
}
