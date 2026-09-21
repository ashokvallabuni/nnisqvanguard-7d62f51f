export type EnvironmentStatus = "CREATING" | "READY" | "RUNNING" | "STOPPED" | "FAILED";

export type EnvironmentLimits = {
  cpus: number;
  memoryMb: number;
  pidsLimit: number;
  timeoutMs: number;
};

export type Environment = {
  providerInstanceId: string;
  status: EnvironmentStatus;
};

export interface LabEnvironmentProvider {
  createEnvironment(limits: EnvironmentLimits): Promise<Environment>;
  startEnvironment(environmentId: string): Promise<Environment>;
  execute(
    environmentId: string,
    command: string,
    timeoutMs: number,
    maxOutputBytes: number,
  ): Promise<{ stdout: string; stderr: string; exitCode: number }>;
  stopEnvironment(environmentId: string): Promise<void>;
  destroyEnvironment(environmentId: string): Promise<void>;
  getEnvironmentStatus(environmentId: string): Promise<EnvironmentStatus>;
  isDockerAvailable?(): Promise<boolean>;
}
