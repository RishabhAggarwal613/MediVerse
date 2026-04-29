"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ClipboardList, Stethoscope } from "lucide-react";

import { AppPageShell } from "@/components/app/app-page-shell";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { unwrapApiErrorMessage } from "@/lib/api/errors";
import {
  fetchMyDoctorProfile,
  updateMyDoctorProfile,
} from "@/lib/api/doctors";
import { cn } from "@/lib/utils";

interface FormVals {
  specialization: string;
  qualifications: string;
  yearsExperience: string;
  consultationFee: string;
  bio: string;
  practiceCity: string;
  languages: string;
}

export default function DoctorProfilePage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["doctor", "me"],
    queryFn: fetchMyDoctorProfile,
  });

  const { register, handleSubmit, reset } = useForm<FormVals>();

  useEffect(() => {
    if (!data) return;
    reset({
      specialization: data.specialization ?? "",
      qualifications: data.qualifications ?? "",
      yearsExperience:
        data.yearsExperience !== null && data.yearsExperience !== undefined
          ? String(data.yearsExperience)
          : "",
      consultationFee:
        data.consultationFee !== null && data.consultationFee !== undefined
          ? String(data.consultationFee)
          : "",
      bio: data.bio ?? "",
      practiceCity: data.practiceCity ?? "",
      languages: data.languages ?? "",
    });
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: updateMyDoctorProfile,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["doctor", "me"] }),
  });

  function onSubmit(values: FormVals) {
    mutation.mutate({
      specialization:
        values.specialization.trim() === ""
          ? undefined
          : values.specialization.trim(),
      qualifications:
        values.qualifications.trim() === ""
          ? undefined
          : values.qualifications.trim(),
      yearsExperience:
        values.yearsExperience.trim() === ""
          ? null
          : Number.parseInt(values.yearsExperience, 10),
      consultationFee:
        values.consultationFee.trim() === ""
          ? null
          : Number.parseFloat(values.consultationFee),
      bio: values.bio.trim() === "" ? undefined : values.bio.trim(),
      practiceCity:
        values.practiceCity.trim() === "" ? undefined : values.practiceCity.trim(),
      languages: values.languages.trim() === "" ? undefined : values.languages.trim(),
    });
  }

  const err = mutation.error ? unwrapApiErrorMessage(mutation.error) : null;

  return (
    <AppPageShell variant="doctor">
      <Container className="relative z-[1] max-w-3xl">
        <header className="mb-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/90 px-3 py-1 text-xs font-medium text-teal-900 shadow-sm backdrop-blur dark:border-teal-800/80 dark:bg-teal-950/60 dark:text-teal-100">
            <Stethoscope className="h-3.5 w-3.5" />
            Public practice profile
          </p>
          <h1 className="mt-4 bg-gradient-to-r from-teal-900 via-sky-900 to-teal-800 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-teal-100 dark:via-sky-100 dark:to-teal-200 sm:text-4xl">
            Professional profile
          </h1>
          <p className="mt-3 max-w-lg text-muted-foreground">
            How patients see your expertise, location, and fees when they browse and book. Account name
            and avatar are managed in your general account settings.
          </p>
        </header>

        {isLoading && !data && (
          <div className="space-y-4 rounded-3xl border border-white/60 bg-white/60 p-8 dark:bg-white/[0.04]">
            <div className="h-11 animate-pulse rounded-xl bg-muted/70" />
            <div className="h-11 animate-pulse rounded-xl bg-muted/70" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-11 animate-pulse rounded-xl bg-muted/70" />
              <div className="h-11 animate-pulse rounded-xl bg-muted/70" />
            </div>
            <div className="h-24 animate-pulse rounded-xl bg-muted/70" />
          </div>
        )}

        {data && (
          <form
            className={cn(
              "space-y-6 rounded-3xl border border-white/65 bg-white/80 p-6 shadow-xl shadow-teal-950/10 backdrop-blur-xl",
              "dark:border-white/10 dark:bg-white/[0.06] sm:p-8",
            )}
            onSubmit={handleSubmit(onSubmit)}
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <ClipboardList className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              Clinic details
            </h2>

            <div className="space-y-5 pt-2">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  className="h-11 rounded-xl border-border bg-background text-foreground shadow-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-teal-500/35 dark:border-white/15 dark:bg-white/[0.08]"
                  {...register("specialization")}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="practiceCity">Primary practice city</Label>
                  <Input
                    id="practiceCity"
                    placeholder="e.g. Bengaluru"
                    className="h-11 rounded-xl border-border bg-background text-foreground shadow-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-teal-500/35 dark:border-white/15 dark:bg-white/[0.08]"
                    {...register("practiceCity")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languages">Languages spoken</Label>
                  <Input
                    id="languages"
                    placeholder="e.g. English, Hindi, Kannada"
                    className="h-11 rounded-xl border-border bg-background text-foreground shadow-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-teal-500/35 dark:border-white/15 dark:bg-white/[0.08]"
                    {...register("languages")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications &amp; training</Label>
                <textarea
                  id="qualifications"
                  rows={3}
                  className="flex min-h-[5rem] w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-teal-500/35 dark:border-white/15 dark:bg-white/[0.08]"
                  {...register("qualifications")}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="years">Years experience</Label>
                  <Input
                    id="years"
                    type="number"
                    min={0}
                    max={80}
                    className="h-11 rounded-xl border-border bg-background text-foreground shadow-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-teal-500/35 dark:border-white/15 dark:bg-white/[0.08]"
                    {...register("yearsExperience")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee">Consultation fee (INR)</Label>
                  <Input
                    id="fee"
                    type="number"
                    step="0.01"
                    min={0}
                    className="h-11 rounded-xl border-border bg-background text-foreground shadow-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-teal-500/35 dark:border-white/15 dark:bg-white/[0.08]"
                    {...register("consultationFee")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  rows={4}
                  className="flex min-h-[6rem] w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-teal-500/35 dark:border-white/15 dark:bg-white/[0.08]"
                  {...register("bio")}
                />
              </div>
            </div>

            {err && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {err}
              </p>
            )}
            {mutation.isSuccess && !mutation.isPending && !err && (
              <p className="text-sm font-medium text-teal-800 dark:text-teal-300">Saved.</p>
            )}

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-full bg-gradient-to-r from-teal-600 to-sky-600 px-8 hover:opacity-95"
            >
              {mutation.isPending ? "Saving…" : "Save profile"}
            </Button>
          </form>
        )}
      </Container>
    </AppPageShell>
  );
}
