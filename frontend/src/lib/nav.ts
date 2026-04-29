import type { Role } from "@/types/api";

export function dashboardPath(role: Role): "/patient" | "/doctor" {
  return role === "PATIENT" ? "/patient" : "/doctor";
}
