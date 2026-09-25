export type FileType = "file" | "dir";

export interface VfsNode {
  name: string;
  type: FileType;
  content?: string;
  children?: Record<string, VfsNode>;
}

export class VirtualFileSystem {
  root: VfsNode;

  constructor(initialState?: VfsNode) {
    if (initialState) {
      this.root = JSON.parse(JSON.stringify(initialState));
    } else {
      this.root = { name: "/", type: "dir", children: {} };
    }
  }

  // Parses path to parts
  private getParts(path: string): string[] {
    return path.split("/").filter((p) => p.length > 0 && p !== ".");
  }

  // Normalizes path based on cwd
  normalizePath(cwd: string, path: string): string {
    if (path.startsWith("/")) {
      return this.resolveParts(this.getParts(path));
    }
    return this.resolveParts([...this.getParts(cwd), ...this.getParts(path)]);
  }

  private resolveParts(parts: string[]): string {
    const stack: string[] = [];
    for (const p of parts) {
      if (p === "..") {
        stack.pop();
      } else if (p !== ".") {
        stack.push(p);
      }
    }
    return "/" + stack.join("/");
  }

  getNode(path: string): VfsNode | null {
    if (path === "/") return this.root;
    const parts = this.getParts(path);
    let current = this.root;
    for (const part of parts) {
      if (current.type !== "dir" || !current.children) return null;
      if (!current.children[part]) return null;
      current = current.children[part];
    }
    return current;
  }

  readFile(path: string): string | null {
    const node = this.getNode(path);
    if (!node || node.type !== "file") return null;
    return node.content ?? "";
  }

  readDir(path: string): string[] | null {
    const node = this.getNode(path);
    if (!node || node.type !== "dir") return null;
    return Object.keys(node.children || {});
  }

  writeFile(path: string, content: string): boolean {
    const parts = this.getParts(path);
    if (parts.length === 0) return false;

    let current = this.root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current.type !== "dir") return false;
      if (!current.children) current.children = {};
      if (!current.children[part]) {
        current.children[part] = { name: part, type: "dir", children: {} };
      }
      current = current.children[part];
    }

    const filename = parts[parts.length - 1];
    if (current.type !== "dir") return false;
    if (!current.children) current.children = {};

    const existing = current.children[filename];
    if (existing && existing.type === "dir") return false;

    current.children[filename] = {
      name: filename,
      type: "file",
      content,
    };
    return true;
  }

  mkdir(path: string): boolean {
    const parts = this.getParts(path);
    if (parts.length === 0) return false;

    let current = this.root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current.type !== "dir") return false;
      if (!current.children) current.children = {};
      if (!current.children[part]) {
        current.children[part] = { name: part, type: "dir", children: {} };
      }
      current = current.children[part];
    }

    const dirname = parts[parts.length - 1];
    if (current.type !== "dir") return false;
    if (!current.children) current.children = {};

    if (current.children[dirname]) return false; // already exists

    current.children[dirname] = {
      name: dirname,
      type: "dir",
      children: {},
    };
    return true;
  }
}
