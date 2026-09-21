export type LabExecutionState = "configuration_required";

export type LabSession = {
  id: string | null;
  state: LabExecutionState;
  message: string;
};

export interface LabExecutionService {
  createSession(labSlug: string): Promise<LabSession>;
  startLab(sessionId: string): Promise<LabSession>;
  getSession(sessionId: string): Promise<LabSession>;
  submitFlag(sessionId: string, flag: string): Promise<LabSession>;
  submitAnswer(sessionId: string, answer: string): Promise<LabSession>;
  resetLab(sessionId: string): Promise<LabSession>;
  terminateSession(sessionId: string): Promise<LabSession>;
}

export const labExecutionService: LabExecutionService = {
  async createSession() {
    return unavailable();
  },
  async startLab() {
    return unavailable();
  },
  async getSession() {
    return unavailable();
  },
  async submitFlag() {
    return unavailable();
  },
  async submitAnswer() {
    return unavailable();
  },
  async resetLab() {
    return unavailable();
  },
  async terminateSession() {
    return unavailable();
  },
};

function unavailable(): LabSession {
  return {
    id: null,
    state: "configuration_required",
    message:
      "Cyber Range infrastructure is being connected. Your account is ready, but live lab execution is not yet enabled.",
  };
}
