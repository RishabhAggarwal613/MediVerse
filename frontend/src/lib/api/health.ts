import { getApiBaseUrl } from "@/lib/env";

type HealthEnvelope = {
  success?: boolean;
  data?: { googleOAuthAvailable?: unknown };
};

export async function fetchHealthFeatures(): Promise<{
  googleOAuthAvailable: boolean;
}> {
  const res = await fetch(`${getApiBaseUrl()}/health`, { credentials: "omit" });
  if (!res.ok) {
    return { googleOAuthAvailable: false };
  }
  try {
    const json: unknown = await res.json();
    const envelope = json as HealthEnvelope;
    if (!envelope.success || typeof envelope.data !== "object" || envelope.data === null) {
      return { googleOAuthAvailable: false };
    }
    const flag = envelope.data.googleOAuthAvailable;
    return {
      googleOAuthAvailable: typeof flag === "boolean" ? flag : false,
    };
  } catch {
    return { googleOAuthAvailable: false };
  }
}
