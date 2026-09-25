import { VirtualFileSystem } from "../filesystem/vfs";

export interface CommandContext {
  vfs: VirtualFileSystem;
  cwd: string;
  setCwd: (path: string) => void;
  stdout: string[];
  stderr: string[];
}

export type CommandFn = (args: string[], ctx: CommandContext) => void;

const commands: Record<string, CommandFn> = {};

commands.pwd = (args, ctx) => {
  ctx.stdout.push(ctx.cwd);
};

commands.cd = (args, ctx) => {
  const target = args[0] || "/home/analyst";
  const path = ctx.vfs.normalizePath(ctx.cwd, target);
  const node = ctx.vfs.getNode(path);
  if (!node) {
    ctx.stderr.push(`cd: ${target}: No such file or directory`);
  } else if (node.type !== "dir") {
    ctx.stderr.push(`cd: ${target}: Not a directory`);
  } else {
    ctx.setCwd(path);
  }
};

commands.ls = (args, ctx) => {
  let showAll = false;
  let showLong = false;
  const paths: string[] = [];

  for (const arg of args) {
    if (arg.startsWith("-")) {
      if (arg.includes("a")) showAll = true;
      if (arg.includes("l")) showLong = true;
    } else {
      paths.push(arg);
    }
  }

  if (paths.length === 0) paths.push(".");

  for (const p of paths) {
    const absPath = ctx.vfs.normalizePath(ctx.cwd, p);
    const node = ctx.vfs.getNode(absPath);
    
    if (!node) {
      ctx.stderr.push(`ls: cannot access '${p}': No such file or directory`);
      continue;
    }

    if (node.type === "file") {
      ctx.stdout.push(node.name);
    } else {
      const children = Object.values(node.children || {});
      const names = children.map(c => c.name);
      if (showAll) {
        names.unshift(".", "..");
      }
      
      const filtered = showAll ? names : names.filter(n => !n.startsWith("."));
      filtered.sort();

      if (showLong) {
        for (const name of filtered) {
          const cNode = name === "." || name === ".." ? {type: "dir"} : children.find(c => c.name === name);
          const typeChar = cNode?.type === "dir" ? "d" : "-";
          const size = cNode?.type === "file" ? (cNode as any).content?.length || 0 : 4096;
          ctx.stdout.push(`${typeChar}rw-r--r-- 1 analyst analyst ${size.toString().padStart(6, " ")} Jan 01 00:00 ${name}`);
        }
      } else {
        if (filtered.length > 0) {
          ctx.stdout.push(filtered.join("  "));
        }
      }
    }
  }
};

commands.cat = (args, ctx) => {
  if (args.length === 0) {
    ctx.stderr.push("cat: missing operand");
    return;
  }
  for (const arg of args) {
    const absPath = ctx.vfs.normalizePath(ctx.cwd, arg);
    const node = ctx.vfs.getNode(absPath);
    if (!node) {
      ctx.stderr.push(`cat: ${arg}: No such file or directory`);
    } else if (node.type === "dir") {
      ctx.stderr.push(`cat: ${arg}: Is a directory`);
    } else {
      ctx.stdout.push(node.content || "");
    }
  }
};

commands.grep = (args, ctx) => {
  // Very simple grep
  let pattern = args[0];
  const files = args.slice(1);
  
  if (!pattern) {
    ctx.stderr.push("grep: missing operand");
    return;
  }

  // Handle quotes
  if ((pattern.startsWith("'") && pattern.endsWith("'")) || (pattern.startsWith('"') && pattern.endsWith('"'))) {
    pattern = pattern.substring(1, pattern.length - 1);
  }

  const stdin = ctx.stdout.splice(0, ctx.stdout.length); // if pipe

  if (files.length === 0) {
    // Search stdin
    const lines = stdin.join("\n").split("\n");
    for (const line of lines) {
      if (line.includes(pattern)) ctx.stdout.push(line);
    }
    return;
  }

  for (const file of files) {
    const absPath = ctx.vfs.normalizePath(ctx.cwd, file);
    const content = ctx.vfs.readFile(absPath);
    if (content === null) {
      ctx.stderr.push(`grep: ${file}: No such file or directory`);
      continue;
    }
    const lines = content.split("\n");
    for (const line of lines) {
      if (line.includes(pattern)) {
        if (files.length > 1) {
          ctx.stdout.push(`${file}:${line}`);
        } else {
          ctx.stdout.push(line);
        }
      }
    }
  }
};

commands.echo = (args, ctx) => {
  ctx.stdout.push(args.join(" "));
};

commands.head = (args, ctx) => {
  let n = 10;
  let files = args;
  if (args[0] === "-n") {
    n = parseInt(args[1], 10);
    files = args.slice(2);
  } else if (args[0]?.startsWith("-n")) {
    n = parseInt(args[0].substring(2), 10);
    files = args.slice(1);
  }

  const stdin = ctx.stdout.splice(0, ctx.stdout.length);
  if (files.length === 0) {
    ctx.stdout.push(stdin.join("\n").split("\n").slice(0, n).join("\n"));
    return;
  }

  for (const file of files) {
    const content = ctx.vfs.readFile(ctx.vfs.normalizePath(ctx.cwd, file));
    if (content !== null) {
      ctx.stdout.push(content.split("\n").slice(0, n).join("\n"));
    } else {
      ctx.stderr.push(`head: ${file}: No such file or directory`);
    }
  }
};

commands.tail = (args, ctx) => {
  let n = 10;
  let files = args;
  if (args[0] === "-n") {
    n = parseInt(args[1], 10);
    files = args.slice(2);
  } else if (args[0]?.startsWith("-n")) {
    n = parseInt(args[0].substring(2), 10);
    files = args.slice(1);
  }

  const stdin = ctx.stdout.splice(0, ctx.stdout.length);
  if (files.length === 0) {
    const lines = stdin.join("\n").split("\n");
    ctx.stdout.push(lines.slice(Math.max(0, lines.length - n)).join("\n"));
    return;
  }

  for (const file of files) {
    const content = ctx.vfs.readFile(ctx.vfs.normalizePath(ctx.cwd, file));
    if (content !== null) {
      const lines = content.split("\n");
      ctx.stdout.push(lines.slice(Math.max(0, lines.length - n)).join("\n"));
    } else {
      ctx.stderr.push(`tail: ${file}: No such file or directory`);
    }
  }
};

commands.wc = (args, ctx) => {
  const countLines = (str: string) => str.split("\n").length;
  const countWords = (str: string) => str.split(/\s+/).filter(x => x.length > 0).length;
  const countBytes = (str: string) => str.length;

  const stdin = ctx.stdout.splice(0, ctx.stdout.length);
  if (args.length === 0) {
    const text = stdin.join("\n");
    ctx.stdout.push(` ${countLines(text)} ${countWords(text)} ${countBytes(text)}`);
    return;
  }

  let l = false, w = false, c = false;
  const files = [];
  for (const arg of args) {
    if (arg.startsWith("-")) {
      if (arg.includes("l")) l = true;
      if (arg.includes("w")) w = true;
      if (arg.includes("c")) c = true;
    } else {
      files.push(arg);
    }
  }
  if (!l && !w && !c) {
    l = true; w = true; c = true;
  }

  for (const file of files) {
    const content = ctx.vfs.readFile(ctx.vfs.normalizePath(ctx.cwd, file));
    if (content !== null) {
      const out = [];
      if (l) out.push(countLines(content));
      if (w) out.push(countWords(content));
      if (c) out.push(countBytes(content));
      out.push(file);
      ctx.stdout.push(" " + out.join(" "));
    } else {
      ctx.stderr.push(`wc: ${file}: No such file or directory`);
    }
  }
};

commands.sort = (args, ctx) => {
  const stdin = ctx.stdout.splice(0, ctx.stdout.length);
  let lines: string[] = [];
  
  if (args.length === 0) {
    lines = stdin.join("\n").split("\n");
  } else {
    for (const file of args) {
      if (file.startsWith("-")) continue;
      const content = ctx.vfs.readFile(ctx.vfs.normalizePath(ctx.cwd, file));
      if (content !== null) lines.push(...content.split("\n"));
    }
  }
  
  lines.sort();
  ctx.stdout.push(lines.join("\n"));
};

commands.uniq = (args, ctx) => {
  let count = false;
  if (args.includes("-c")) count = true;

  const stdin = ctx.stdout.splice(0, ctx.stdout.length);
  let lines: string[] = [];
  const files = args.filter(a => !a.startsWith("-"));
  
  if (files.length === 0) {
    lines = stdin.join("\n").split("\n");
  } else {
    const content = ctx.vfs.readFile(ctx.vfs.normalizePath(ctx.cwd, files[0]));
    if (content !== null) lines = content.split("\n");
  }

  if (lines.length === 0) return;

  const out = [];
  let current = lines[0];
  let c = 1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === current) {
      c++;
    } else {
      out.push(count ? `  ${c} ${current}` : current);
      current = lines[i];
      c = 1;
    }
  }
  out.push(count ? `  ${c} ${current}` : current);
  ctx.stdout.push(out.join("\n"));
};

commands.awk = (args, ctx) => {
  // Extremely basic awk implementation just for print $N
  let script = args[0];
  const files = args.slice(1);
  
  if (!script) return;
  if ((script.startsWith("'") && script.endsWith("'")) || (script.startsWith('"') && script.endsWith('"'))) {
    script = script.substring(1, script.length - 1);
  }

  const stdin = ctx.stdout.splice(0, ctx.stdout.length);
  let lines: string[] = [];
  
  if (files.length === 0) {
    lines = stdin.join("\n").split("\n");
  } else {
    for (const file of files) {
      const content = ctx.vfs.readFile(ctx.vfs.normalizePath(ctx.cwd, file));
      if (content !== null) lines.push(...content.split("\n"));
    }
  }

  const match = script.match(/print\s+\$(\d+)/);
  if (match) {
    const col = parseInt(match[1], 10) - 1;
    for (const line of lines) {
      const cols = line.trim().split(/\s+/);
      if (cols.length > col && col >= 0) {
        ctx.stdout.push(cols[col]);
      } else {
        ctx.stdout.push("");
      }
    }
  } else {
    ctx.stderr.push("awk: unsupported script format in sandbox");
  }
};

commands.whoami = (args, ctx) => {
  ctx.stdout.push("analyst");
};

// Parser to handle pipes
export function executeCommandString(cmdStr: string, ctx: CommandContext) {
  const parts = cmdStr.split("|").map(p => p.trim()).filter(p => p.length > 0);
  
  for (const part of parts) {
    // Split by spaces respecting quotes
    const args = (part.match(/([^\s"']+|"[^"]*"|'[^']*')/g) || []).map(a => 
      a.replace(/^['"](.*)['"]$/, '$1')
    );
    
    if (args.length === 0) continue;
    
    const cmd = args[0];
    const cmdArgs = args.slice(1);
    
    if (commands[cmd]) {
      commands[cmd](cmdArgs, ctx);
    } else {
      ctx.stderr.push(`${cmd}: command not found`);
      break;
    }
  }
}
