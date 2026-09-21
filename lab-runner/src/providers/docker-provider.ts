import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import type {
  Environment,
  EnvironmentLimits,
  EnvironmentStatus,
  LabEnvironmentProvider,
} from "./types.js";

const image = process.env.LAB_DOCKER_IMAGE ?? "nisq-linux-security-fundamentals:local";
const maxCommandLength = 2000;

function runDocker(
  args: string[],
  timeoutMs: number,
  maxOutputBytes = 64 * 1024,
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn("docker", args, { windowsHide: true });
    let stdout = "";
    let stderr = "";
    let truncated = false;
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
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
  async createEnvironment(limits: EnvironmentLimits): Promise<Environment> {
    const id = `nisq-lab-${randomUUID()}`;
    await runDocker(
      [
        "run",
        "--detach",
        "--name",
        id,
        "--network",
        "none",
        "--read-only",
        "--cap-drop",
        "ALL",
        "--security-opt",
        "no-new-privileges:true",
        "--cpus",
        String(limits.cpus),
        "--memory",
        `${limits.memoryMb}m`,
        "--pids-limit",
        String(limits.pidsLimit),
        "--tmpfs",
        "/tmp:size=64m",
        "--tmpfs",
        "/home/student:size=128m",
        image,
        "sleep",
        "infinity",
      ],
      limits.timeoutMs,
    );
    return { providerInstanceId: id, status: "READY" };
  }

  async startEnvironment(environmentId: string): Promise<Environment> {
    await runDocker(["start", environmentId], 10_000);
    return { providerInstanceId: environmentId, status: "RUNNING" };
  }

  async execute(environmentId: string, command: string, timeoutMs: number, maxOutputBytes: number) {
    if (!command.trim() || command.length > maxCommandLength) {
      throw new Error("INVALID_COMMAND");
    }
    const result = await runDocker(
      ["exec", "--user", "student", environmentId, "sh", "-lc", command],
      timeoutMs,
      maxOutputBytes,
    );
    return result;
  }

  async stopEnvironment(environmentId: string) {
    await runDocker(["stop", "--time", "2", environmentId], 10_000);
  }

  async destroyEnvironment(environmentId: string) {
    await runDocker(["rm", "--force", "--volumes", environmentId], 10_000);
  }

  async getEnvironmentStatus(environmentId: string): Promise<EnvironmentStatus> {
    const result = await runDocker(
      ["inspect", "--format", "{{.State.Status}}", environmentId],
      5_000,
    );
    if (result.exitCode !== 0) return "FAILED";
    if (result.stdout.trim() === "running") return "RUNNING";
    if (result.stdout.trim() === "created") return "READY";
    return "STOPPED";
  }
}
