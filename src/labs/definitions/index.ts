import { LabDefinition } from "./types";
import { linuxSshBruteforceLab } from "./linux";
import { suricataNidsLab } from "./suricata";
import { sqliInvestigationLab } from "./sqli";
import { memoryForensicsLab } from "./memory";

export const labDefinitions: Record<string, LabDefinition> = {
  [linuxSshBruteforceLab.slug]: linuxSshBruteforceLab,
  [suricataNidsLab.slug]: suricataNidsLab,
  [sqliInvestigationLab.slug]: sqliInvestigationLab,
  [memoryForensicsLab.slug]: memoryForensicsLab,
  // Alias for backward compatibility
  "linux-security-fundamentals": linuxSshBruteforceLab,
};

export function getLabDefinition(slug: string): LabDefinition | null {
  return labDefinitions[slug] || null;
}
