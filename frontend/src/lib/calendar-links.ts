import type { AppointmentDto } from "@/types/appointments";

const DEFAULT_DURATION_MS = 30 * 60 * 1000;

function parseScheduledLocal(isoLocal: string): Date | null {
  try {
    const normalized = isoLocal.includes("T")
      ? isoLocal
      : isoLocal.replace(" ", "T");
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/**
 * Google Calendar "Add event" expects YYYYMMDDTHHmmss in the user's local timezone
 * (no Z suffix — browser interprets wall time like the UI {@code formatWhen} helpers).
 */
function formatGoogleCalendarLocalDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}

function buildAppointmentDetails(a: AppointmentDto): string {
  const lines: string[] = [];
  lines.push(
    `MediVerse — ${a.consultationMode === "VIDEO" ? "Video consultation" : "In-clinic visit"}`,
  );
  if (a.reason?.trim()) lines.push(`Reason: ${a.reason.trim()}`);
  if (a.consultationMode === "VIDEO" && a.meetJoinUrl?.trim()) {
    lines.push("");
    lines.push("Video meeting link:");
    lines.push(a.meetJoinUrl.trim());
  }
  lines.push("");
  lines.push(`Status: ${a.status}`);
  return lines.join("\n");
}

function buildAppointmentLocation(a: AppointmentDto): string | undefined {
  if (a.consultationMode === "VIDEO") {
    return a.meetJoinUrl?.trim() || "Video (link in description)";
  }
  return a.practiceAddressFormatted?.trim() || undefined;
}

/**
 * Opens Google Calendar compose with title, time (30 min default), location, and details
 * (includes video join URL when present).
 */
export function appointmentGoogleCalendarHref(
  a: AppointmentDto,
  role: "patient" | "doctor",
): string | null {
  if (a.status === "CANCELLED" || a.status === "REJECTED") return null;
  const start = parseScheduledLocal(a.scheduledAt);
  if (!start) return null;
  const end = new Date(start.getTime() + DEFAULT_DURATION_MS);
  const title =
    role === "patient"
      ? `MediVerse — ${a.doctorName}`
      : `MediVerse — ${a.patientName}`;
  const params = new URLSearchParams();
  params.set("action", "TEMPLATE");
  params.set("text", title);
  params.set(
    "dates",
    `${formatGoogleCalendarLocalDate(start)}/${formatGoogleCalendarLocalDate(end)}`,
  );
  params.set("details", buildAppointmentDetails(a));
  const loc = buildAppointmentLocation(a);
  if (loc) params.set("location", loc);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
