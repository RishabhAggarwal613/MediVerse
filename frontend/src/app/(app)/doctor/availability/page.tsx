"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addAvailabilityRule,
  deleteAvailabilityRule,
  fetchMyAvailabilityRules,
} from "@/lib/api/doctors";
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
    qc.invalidateQueries({ queryKey: ["doctor", "my", "availability"] });

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
    <Container className="py-10">
      <h1 className="text-2xl font-bold tracking-tight">Weekly availability</h1>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground">
        MediVerse generates bookable slots for the next{" "}
        <strong>14 days</strong> whenever you save changes. Appointment booking is
        coming in Phase 5.
      </p>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : (
        <ul className="mt-10 space-y-3">
          {rules.map((r: DoctorAvailabilityRuleDto) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 px-4 py-3"
            >
              <div className="text-sm">
                <span className="font-semibold">{r.dayOfWeek}</span>{" "}
                <span className="text-muted-foreground">
                  {fmt(r.startTime)}–{fmt(r.endTime)}, {r.slotDurationMinutes}
                  min
                  {r.requiresApproval ? ", needs approval" : ""}
                  {!r.active ? ", inactive" : ""}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onDelete(r.id)}
                disabled={delMut.isPending}
              >
                Delete
              </Button>
            </li>
          ))}
          {rules.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No recurring windows yet — add one below.
            </p>
          )}
        </ul>
      )}

      <form
        onSubmit={onAdd}
        className="mt-12 max-w-lg space-y-4 rounded-3xl border border-white/60 bg-white/70 p-6 dark:border-white/10 dark:bg-white/[0.03]"
      >
        <h2 className="text-lg font-semibold">Add weekly window</h2>

        <div className="space-y-2">
          <Label>Day</Label>
          <select
            className="flex h-11 w-full rounded-2xl border border-border/80 bg-white/90 px-3 text-sm dark:bg-white/[0.06]"
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
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">Ends</Label>
            <Input
              id="end"
              type="time"
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
              value={dur}
              onChange={(e) => setDur(Number(e.target.value))}
            />
          </div>
          <label className="mt-8 flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={needApproval}
              onChange={(e) => setNeedApproval(e.target.checked)}
            />
            Appointment needs doctor approval first
          </label>
        </div>
        {formErr && (
          <p className="text-sm text-destructive">{formErr}</p>
        )}
        <Button type="submit" disabled={addMut.isPending}>
          {addMut.isPending ? "Saving…" : "Generate slots from this rule"}
        </Button>
      </form>
    </Container>
  );
}
