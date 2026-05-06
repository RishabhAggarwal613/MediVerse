"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Building2, CalendarClock, Trash2, Video } from "lucide-react";

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
import { unwrapApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type { ConsultationMode, DoctorAvailabilityRuleDto, ScheduleDay } from "@/types/doctors";

const DAYS: ScheduleDay[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const DAY_LABEL: Record<ScheduleDay, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

function fmt(t: string) {
  return t.length >= 8 ? t.slice(0, 5) : t.slice(0, 5);
}

function sortRules(list: DoctorAvailabilityRuleDto[]) {
  return [...list].sort((a, b) => {
    const di = DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek);
    if (di !== 0) return di;
    return a.startTime.localeCompare(b.startTime);
  });
}

export default function DoctorAvailabilityPage() {
  const qc = useQueryClient();

  const {
    data: rules = [],
    isLoading,
    isError: rulesQueryError,
    error: rulesQueryFailure,
    refetch: refetchRules,
    isFetching: rulesFetching,
  } = useQuery({
    queryKey: ["doctor", "my", "availability"],
    queryFn: fetchMyAvailabilityRules,
  });

  const [dayOfWeek, setDayOfWeek] = useState<ScheduleDay>("MON");
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>("IN_CLINIC");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [dur, setDur] = useState(30);
  const [needApproval, setNeedApproval] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<number | null>(null);

  const sortedRules = useMemo(() => sortRules(rules), [rules]);
  const inactiveRules = useMemo(() => sortRules(sortedRules.filter((r) => !r.active)), [sortedRules]);
  const activeSorted = useMemo(() => sortedRules.filter((r) => r.active), [sortedRules]);
  const clinicRules = useMemo(
    () => activeSorted.filter((r) => r.consultationMode === "IN_CLINIC"),
    [activeSorted],
  );
  const videoRules = useMemo(
    () => activeSorted.filter((r) => r.consultationMode === "VIDEO"),
    [activeSorted],
  );

  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: ["doctor", "my", "availability"] });

  const addMut = useMutation({
    mutationFn: addAvailabilityRule,
    onSuccess: () => {
      setFormErr(null);
      invalidate();
    },
    onError: (e: unknown) => setFormErr(unwrapApiErrorMessage(e)),
  });

  const delMut = useMutation({
    mutationFn: deleteAvailabilityRule,
    onMutate: (ruleId: number) => {
      setDeleteErr(null);
      setDeletingRuleId(ruleId);
    },
    onSuccess: () => {
      setDeleteErr(null);
      invalidate();
    },
    onError: (e: unknown) => setDeleteErr(unwrapApiErrorMessage(e)),
    onSettled: () => setDeletingRuleId(null),
  });

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    const slotMinutes = Number.isFinite(dur) ? Math.min(240, Math.max(10, Math.trunc(dur))) : 30;
    if (slotMinutes !== dur) {
      setDur(slotMinutes);
    }
    addMut.mutate({
      dayOfWeek,
      consultationMode,
      startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
      endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
      slotDurationMinutes: slotMinutes,
      requiresApproval: needApproval,
    });
  }

  function onDelete(id: number) {
    if (typeof window !== "undefined" && !window.confirm("Delete this rule?")) return;
    setDeleteErr(null);
    delMut.mutate(id);
  }

  function RuleRow({ r, archived = false }: { r: DoctorAvailabilityRuleDto; archived?: boolean }) {
    const isVideo = r.consultationMode === "VIDEO";
    return (
      <li
        className={cn(
          "flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 shadow-sm",
          archived && "opacity-90 border-muted-foreground/25 bg-muted/25",
          !archived &&
            (isVideo
              ? "border-violet-200/70 bg-violet-50/50 dark:border-violet-900/40 dark:bg-violet-950/20"
              : "border-teal-200/70 bg-teal-50/50 dark:border-teal-900/40 dark:bg-teal-950/20"),
        )}
      >
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              archived && "bg-muted text-muted-foreground",
              !archived &&
                (isVideo
                  ? "bg-violet-200/80 text-violet-900 dark:bg-violet-500/20 dark:text-violet-100"
                  : "bg-teal-200/80 text-teal-900 dark:bg-teal-500/20 dark:text-teal-100"),
            )}
          >
            {isVideo ? <Video className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
          </span>
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-foreground">{DAY_LABEL[r.dayOfWeek]}</p>
            <p className="mt-0.5 text-muted-foreground">
              {isVideo ? "Video visit" : "In-clinic visit"} · {fmt(r.startTime)}–{fmt(r.endTime)} ·{" "}
              {r.slotDurationMinutes} min slots
              {r.requiresApproval ? " · approval required" : " · instant confirm"}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 border-destructive/25 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(r.id)}
          disabled={delMut.isPending && deletingRuleId === r.id}
        >
          <Trash2 className="h-4 w-4" />
          {delMut.isPending && deletingRuleId === r.id ? "Removing…" : "Remove"}
        </Button>
      </li>
    );
  }

  return (
    <AppPageShell variant="doctor">
      <Container className="relative z-[1] max-w-5xl pb-16">
        <header className="mb-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/90 px-3 py-1 text-xs font-medium text-teal-900 shadow-sm backdrop-blur dark:border-teal-800/80 dark:bg-black/40 dark:text-teal-100">
            <CalendarClock className="h-3.5 w-3.5" />
            Scheduling
          </p>
          <h1 className="mt-4 bg-gradient-to-r from-teal-900 via-sky-900 to-teal-800 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-teal-100 dark:via-sky-100 dark:to-teal-200 sm:text-4xl">
            Weekly availability
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            Set when you accept <strong className="font-medium text-foreground">in-clinic</strong> and{" "}
            <strong className="font-medium text-foreground">video</strong> visits. Each rule creates
            bookable slots for the next two weeks. You can use the same hours for both visit types — they
            do not block each other.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          <section className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground dark:bg-white/[0.03]">
              <p className="font-medium text-foreground">Quick tips</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Add one rule per visit type if you offer both clinic and video at the same times.</li>
                <li>If you change hours for the same visit type on a day, older overlapping windows are archived automatically.</li>
                <li>Changes apply to the next two weeks of open slots (saved appointments are unchanged).</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight">Your schedule</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Active rules are grouped by visit type. Archived inactive rules appear below — remove them if
                you see a conflict you do not recognise.
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[4.5rem] animate-pulse rounded-2xl border border-white/50 bg-white/50 dark:bg-white/[0.04]"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {rulesQueryError && (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <p>{unwrapApiErrorMessage(rulesQueryFailure)}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      disabled={rulesFetching}
                      onClick={() => void refetchRules()}
                    >
                      {rulesFetching ? "Retrying…" : "Retry"}
                    </Button>
                  </div>
                )}
                {deleteErr && (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {deleteErr}
                  </div>
                )}

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-teal-900 dark:text-teal-200">
                    <Building2 className="h-4 w-4" />
                    In-clinic
                  </h3>
                  {clinicRules.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-teal-300/50 bg-teal-50/30 px-4 py-6 text-center text-sm text-muted-foreground dark:border-teal-900/50 dark:bg-teal-950/15">
                      No in-clinic windows yet.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {clinicRules.map((r) => (
                        <RuleRow key={r.id} r={r} />
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-violet-900 dark:text-violet-200">
                    <Video className="h-4 w-4" />
                    Video
                  </h3>
                  {videoRules.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-violet-300/50 bg-violet-50/30 px-4 py-6 text-center text-sm text-muted-foreground dark:border-violet-900/50 dark:bg-violet-950/15">
                      No video windows yet.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {videoRules.map((r) => (
                        <RuleRow key={r.id} r={r} />
                      ))}
                    </ul>
                  )}
                </div>

                {inactiveRules.length > 0 && (
                  <div className="rounded-2xl border border-dashed border-muted-foreground/35 bg-muted/15 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Archived (inactive)</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Not shown to patients. Delete entries here if the app reports an overlap but your active
                      schedule looks empty.
                    </p>
                    <ul className="mt-3 space-y-2">
                      {inactiveRules.map((r) => (
                        <RuleRow key={r.id} r={r} archived />
                      ))}
                    </ul>
                  </div>
                )}

                {activeSorted.length === 0 && inactiveRules.length === 0 && !rulesQueryError && (
                  <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
                    No rules yet — use the panel on the right to add your first weekly window.
                  </p>
                )}
              </div>
            )}
          </section>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-6">
              <form
                onSubmit={onAdd}
                className={cn(
                  "space-y-5 rounded-3xl border border-white/65 bg-white/85 p-6 shadow-xl shadow-teal-950/10 backdrop-blur-xl",
                  "dark:border-white/10 dark:bg-white/[0.06]",
                )}
              >
                <h2 className="flex items-center gap-2 border-b border-border/50 pb-3 text-lg font-semibold tracking-tight">
                  <CalendarClock className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  Add a window
                </h2>

                <div className="space-y-2">
                  <Label>Visit type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={consultationMode === "IN_CLINIC" ? "default" : "outline"}
                      className={cn(
                        "h-auto flex-col gap-1 py-3 rounded-xl",
                        consultationMode === "IN_CLINIC" &&
                          "bg-gradient-to-r from-teal-600 to-teal-700 hover:opacity-95",
                      )}
                      onClick={() => setConsultationMode("IN_CLINIC")}
                    >
                      <Building2 className="h-5 w-5" />
                      <span className="text-xs font-medium">In-clinic</span>
                    </Button>
                    <Button
                      type="button"
                      variant={consultationMode === "VIDEO" ? "default" : "outline"}
                      className={cn(
                        "h-auto flex-col gap-1 py-3 rounded-xl",
                        consultationMode === "VIDEO" &&
                          "bg-gradient-to-r from-violet-600 to-violet-700 hover:opacity-95",
                      )}
                      onClick={() => setConsultationMode("VIDEO")}
                    >
                      <Video className="h-5 w-5" />
                      <span className="text-xs font-medium">Video</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="day">Day of week</Label>
                  <select
                    id="day"
                    className="flex h-11 w-full rounded-xl border border-border/80 bg-white/90 px-3 text-sm dark:bg-white/[0.06]"
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value as ScheduleDay)}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {DAY_LABEL[d]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="start">From</Label>
                    <Input
                      id="start"
                      type="time"
                      className="h-11 rounded-xl"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">To</Label>
                    <Input
                      id="end"
                      type="time"
                      className="h-11 rounded-xl"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dur">Slot length (minutes)</Label>
                    <Input
                      id="dur"
                      type="number"
                      min={10}
                      max={240}
                      className="h-11 rounded-xl"
                      value={Number.isFinite(dur) ? dur : ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") {
                          setDur(NaN);
                          return;
                        }
                        const n = Number.parseInt(v, 10);
                        setDur(Number.isFinite(n) ? n : 30);
                      }}
                    />
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm sm:mt-7">
                    <input
                      type="checkbox"
                      checked={needApproval}
                      className="rounded border-border text-teal-600 focus:ring-teal-500"
                      onChange={(e) => setNeedApproval(e.target.checked)}
                    />
                    Require my approval before confirming
                  </label>
                </div>

                {formErr && <p className="text-sm text-destructive">{formErr}</p>}
                <Button
                  type="submit"
                  disabled={addMut.isPending}
                  className={cn(
                    "w-full rounded-full font-medium",
                    consultationMode === "VIDEO"
                      ? "bg-gradient-to-r from-violet-600 to-violet-700 hover:opacity-95"
                      : "bg-gradient-to-r from-teal-600 to-sky-600 hover:opacity-95",
                  )}
                >
                  {addMut.isPending ? "Saving…" : "Save and refresh slots"}
                </Button>
              </form>
            </div>
          </aside>
        </div>
      </Container>
    </AppPageShell>
  );
}
