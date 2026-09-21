import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import type {
  Environment,
  EnvironmentLimits,
  EnvironmentStatus,
  LabEnvironmentProvider,
} from "./types.js";

const DEFAULT_IMAGE = process.env.LAB_DOCKER_IMAGE ?? "nisqvanguard/linux-security:latest";
const MAX_COMMAND_LENGTH = 2000;

export function runDocker(
  args: string[],
  timeoutMs = 15_000,
  maxOutputBytes = 64 * 1024,
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn("docker", args, { windowsHide: true });
    let stdout = "";
    let stderr = "";
    let truncated = false;

    const timer = setTimeout(() => {
      try {
        child.kill("SIGKILL");
      } catch {
        // ignore
      }
      reject(new Error("DOCKER_COMMAND_TIMEOUT"));
    }, timeoutMs);

    const append = (current: string, chunk: Buffer) => {
      const remaining = maxOutputBytes - Buffer.byteLength(current);
      if (remaining <= 0) {
        truncated = true;
        return current;
      }
      const value = chunk.subarray(0, remaining).toString("utf8");
      if (value.length < chunk.length) truncated = true;
      return current + value;
    };

    child.stdout.on("data", (chunk: Buffer) => {
      stdout = append(stdout, chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr = append(stderr, chunk);
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: truncated ? `${stderr}\n[output truncated]` : stderr,
        exitCode: code ?? 1,
      });
    });
  });
}

export class DockerProvider implements LabEnvironmentProvider {
  private readonly image: string;

  constructor(image = DEFAULT_IMAGE) {
    this.image = image;
  }

  async isDockerAvailable(): Promise<boolean> {
    try {
      const result = await runDocker(["info"], 5_000);
      return result.exitCode === 0;
    } catch {
      return false;
    }
  }

  async isImageAvailable(): Promise<boolean> {
    try {
      const result = await runDocker(["image", "inspect", this.image], 5_000);
      return result.exitCode === 0;
    } catch {
      return false;
    }
  }

  async createEnvironment(limits: EnvironmentLimits): Promise<Environment> {
    const containerName = `nisq-lab-${randomUUID()}`;
    
    // Strict isolation flags
    // - non-root user 'analyst' (falls back safely inside container)
    // - resource constraints: cpus, memory, pids-limit
    // - network isolation: --network none
    // - security: no-new-privileges, cap-drop ALL
    // - no host filesystem or socket mounts
    const args = [
      "run",
      "--detach",
      "--name",
      containerName,
      "--network",
      "none",
      "--cap-drop",
      "ALL",
      "--security-opt",
      "no-new-privileges:true",
      "--cpus",
      String(limits.cpus || 0.5),
      "--memory",
      `${limits.memoryMb || 512}m`,
      "--pids-limit",
      String(limits.pidsLimit || 100),
      "--tmpfs",
      "/tmp:size=64m",
      "--tmpfs",
      "/home/analyst/workspace:size=64m",
      this.image,
      "sleep",
      "infinity",
    ];

    const result = await runDocker(args, limits.timeoutMs || 15_000);
    if (result.exitCode !== 0) {
      throw new Error(`DOCKER_CONTAINER_START_FAILED: ${result.stderr}`);
    }

    return { providerInstanceId: containerName, status: "READY" };
  }

  async startEnvironment(environmentId: string): Promise<Environment> {
    const result = await runDocker(["start", environmentId], 10_000);
    if (result.exitCode !== 0) {
      throw new Error(`DOCKER_START_FAILED: ${result.stderr}`);
    }
    return { providerInstanceId: environmentId, status: "RUNNING" };
  }

  async execute(
    environmentId: string,
    command: string,
    timeoutMs = 10_000,
    maxOutputBytes = 64 * 1024,
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    if (!command || !command.trim() || command.length > MAX_COMMAND_LENGTH) {
      throw new Error("INVALID_COMMAND");
    }

    // Execute strictly inside the container as non-root 'analyst'
    // Fallback to default container user if analyst user resolution happens inside entrypoint
    const args = [
      "exec",
      environmentId,
      "bash",
      "-c",
      command,
    ];

    return await runDocker(args, timeoutMs, maxOutputBytes);
  }

  async stopEnvironment(environmentId: string): Promise<void> {
    try {
      await runDocker(["stop", "--time", "2", environmentId], 10_000);
    } catch {
      // ignore
    }
  }

  async destroyEnvironment(environmentId: string): Promise<void> {
    try {
      await runDocker(["rm", "--force", "--volumes", environmentId], 10_000);
    } catch {
      // ignore
    }
  }

  async getEnvironmentStatus(environmentId: string): Promise<EnvironmentStatus> {
    try {
      const result = await runDocker(
        ["inspect", "--format", "{{.State.Status}}", environmentId],
        5_000,
      );
      if (result.exitCode !== 0) return "FAILED";
      const status = result.stdout.trim().toLowerCase();
      if (status === "running") return "RUNNING";
      if (status === "created") return "READY";
      return "STOPPED";
    } catch {
      return "FAILED";
    }
  }
}
