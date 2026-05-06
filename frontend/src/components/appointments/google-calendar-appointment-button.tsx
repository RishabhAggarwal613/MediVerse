"use client";

import { CalendarPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { appointmentGoogleCalendarHref } from "@/lib/calendar-links";
import { cn } from "@/lib/utils";
import type { AppointmentDto } from "@/types/appointments";

export function GoogleCalendarAppointmentButton({
  appointment,
  role,
  className,
}: {
  appointment: AppointmentDto;
  role: "patient" | "doctor";
  className?: string;
}) {
  const href =
    appointment.googleCalendarHtmlLink?.trim() ||
    appointmentGoogleCalendarHref(appointment, role);
  if (!href) return null;

  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className={cn(
        "rounded-full border-violet-200/80 bg-violet-50/90 shadow-sm backdrop-blur dark:border-violet-900/45 dark:bg-violet-950/35",
        className,
      )}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title="Opens Google Calendar with date, place or video link, and meeting URL in the description."
        className="inline-flex items-center gap-1.5"
      >
        <CalendarPlus className="h-4 w-4 shrink-0" aria-hidden />
        Google Calendar
      </a>
    </Button>
  );
}
