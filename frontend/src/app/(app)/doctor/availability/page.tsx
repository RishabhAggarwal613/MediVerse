"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarClock, Clock, Trash2 } from "lucide-react";

import { AppPageShell } from "@/components/app/app-page-shell";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addAvailabilityRule,
  deleteAvailabilityRule,
  fetchMyAvailabilityRules,
} from "@/lib/api/doctors";
import { cn } from "@/lib/utils";
import type { DoctorAvailabilityRuleDto, ScheduleDay } from "@/types/doctors";

const DAYS: ScheduleDay[] = [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
];

function fmt(t: string) {
  return t.length >= 8 ? t.slice(0, 5) : t.slice(0, 5);
}

export default function DoctorAvailabilityPage() {
  const qc = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["doctor", "my", "availability"],
    queryFn: fetchMyAvailabilityRules,
  });

  const [dayOfWeek, setDayOfWeek] = useState<ScheduleDay>("MON");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [dur, setDur] = useState(30);
  const [needApproval, setNeedApproval] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: ["doctor", "my", "availability"] });

  const addMut = useMutation({
    mutationFn: addAvailabilityRule,
    onSuccess: () => invalidate(),
    onError: () => setFormErr("Could not add rule."),
  });

  const delMut = useMutation({
    mutationFn: deleteAvailabilityRule,
    onSuccess: () => invalidate(),
  });

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    addMut.mutate({
      dayOfWeek,
      startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
      endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
      slotDurationMinutes: dur,
      requiresApproval: needApproval,
    });
  }

  function onDelete(id: number) {
    if (typeof window !== "undefined" && !window.confirm("Delete this rule?")) return;
    delMut.mutate(id);
  }

  return (
    <AppPageShell variant="doctor">
      <Container className="relative z-[1] max-w-3xl">
        <header className="mb-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/90 px-3 py-1 text-xs font-medium text-teal-900 shadow-sm backdrop-blur dark:border-teal-800/80 dark:bg-teal-950/60 dark:text-teal-100">
            <CalendarClock className="h-3.5 w-3.5" />
            Scheduling
          </p>
          <h1 className="mt-4 bg-gradient-to-r from-teal-900 via-sky-900 to-teal-800 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-teal-100 dark:via-sky-100 dark:to-teal-200 sm:text-4xl">
            Weekly availability
          </h1>
          <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">
            Define repeating windows where you accept bookings. MediVerse turns each window into
            bookable slots for the{" "}
            <strong className="font-medium text-foreground">next two weeks</strong> after you save
            a rule. Patients only see slots that fall inside these windows — and respect your approval
            setting when required.
          </p>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[4.75rem] animate-pulse rounded-2xl border border-white/50 bg-white/50 dark:bg-white/[0.04]"
              />
            ))}
          </div>
        ) : (
          <ul className="space-y-3">
            {rules.map((r: DoctorAvailabilityRuleDto) => (
              <li
                key={r.id}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/65 bg-white/80 px-5 py-4 shadow-md shadow-teal-950/5 backdrop-blur-xl",
                  "dark:border-white/10 dark:bg-white/[0.06]",
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-500/25 dark:text-teal-100">
                    <Clock className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold text-foreground">{r.dayOfWeek}</p>
                    <p className="mt-0.5 text-muted-foreground">
                      {fmt(r.startTime)}–{fmt(r.endTime)} · {r.slotDurationMinutes} min
                      {r.requiresApproval ? " · approval required" : ""}
                      {!r.active ? " · inactive" : ""}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 border-destructive/25 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(r.id)}
                  disabled={delMut.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </li>
            ))}
            {rules.length === 0 && (
              <p className="rounded-2xl border border-dashed border-teal-300/45 bg-teal-50/40 px-6 py-10 text-center text-sm text-muted-foreground dark:border-teal-800/60 dark:bg-teal-950/25">
                No recurring windows yet — add one in the form below so patients can start booking.
              </p>
            )}
          </ul>
        )}

        <form
          onSubmit={onAdd}
          className={cn(
            "mt-12 space-y-5 rounded-3xl border border-white/65 bg-white/80 p-6 shadow-xl shadow-teal-950/10 backdrop-blur-xl",
            "dark:border-white/10 dark:bg-white/[0.06] sm:p-8",
          )}
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <CalendarClock className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            Add weekly window
          </h2>

          <div className="space-y-2">
            <Label>Day</Label>
            <select
              className="flex h-11 w-full rounded-xl border border-border/80 bg-white/90 px-3 text-sm dark:bg-white/[0.06]"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value as ScheduleDay)}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start">Starts</Label>
              <Input
                id="start"
                type="time"
                className="h-11 rounded-xl"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Ends</Label>
              <Input
                id="end"
                type="time"
                className="h-11 rounded-xl"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dur">Slot length (minutes)</Label>
              <Input
                id="dur"
                type="number"
                min={10}
                max={240}
                className="h-11 rounded-xl"
                value={dur}
                onChange={(e) => setDur(Number(e.target.value))}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 self-end pb-2 text-sm">
              <input
                type="checkbox"
                checked={needApproval}
                className="rounded border-border text-teal-600 focus:ring-teal-500"
                onChange={(e) => setNeedApproval(e.target.checked)}
              />
              Appointment needs doctor approval first
            </label>
          </div>
          {formErr && <p className="text-sm text-destructive">{formErr}</p>}
          <Button
            type="submit"
            disabled={addMut.isPending}
            className="rounded-full bg-gradient-to-r from-teal-600 to-sky-600 hover:opacity-95"
          >
            {addMut.isPending ? "Saving…" : "Save rule & refresh slots"}
          </Button>
        </form>
      </Container>
    </AppPageShell>
  );
}
