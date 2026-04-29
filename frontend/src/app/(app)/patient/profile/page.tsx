"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Camera, Mail, ShieldCheck, UserRound } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { AppPageShell } from "@/components/app/app-page-shell";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { unwrapApiErrorMessage } from "@/lib/api/errors";
import {
  fetchCurrentUser,
  updateAccountProfile,
  uploadAccountAvatar,
} from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

import type { Gender } from "@/types/api";

const FIELD =
  "h-11 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground shadow-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-white/15 dark:bg-white/[0.08]";

const TEXTAREA =
  "min-h-[5rem] w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-white/15 dark:bg-white/[0.08]";

interface FormVals {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: "" | Gender;
  bloodGroup: string;
  allergies: string;
  emergencyContact: string;
}

function isoDatePrefix(v: string | null | undefined): string {
  if (!v) return "";
  return v.length >= 10 ? v.slice(0, 10) : v;
}

export default function PatientProfilePage() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const fileRef = useRef<HTMLInputElement>(null);

  const userQ = useQuery({
    queryKey: ["users", "me"],
    queryFn: fetchCurrentUser,
    staleTime: 15_000,
  });

  const { register, handleSubmit, reset } = useForm<FormVals>({
    defaultValues: {
      fullName: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      allergies: "",
      emergencyContact: "",
    },
  });

  useEffect(() => {
    const u = userQ.data;
    if (!u) return;
    const p = u.patientProfile;
    reset({
      fullName: u.fullName,
      phone: u.phone ?? "",
      dateOfBirth: isoDatePrefix(p?.dateOfBirth ?? null),
      gender: (p?.gender as FormVals["gender"]) ?? "",
      bloodGroup: p?.bloodGroup ?? "",
      allergies: p?.allergies ?? "",
      emergencyContact: p?.emergencyContact ?? "",
    });
  }, [userQ.data, reset]);

  const saveMut = useMutation({
    mutationFn: (values: FormVals) =>
      updateAccountProfile({
        fullName: values.fullName.trim(),
        phone: values.phone.trim() === "" ? null : values.phone.trim(),
        ...(values.dateOfBirth.trim() !== ""
          ? { dateOfBirth: values.dateOfBirth.trim() }
          : {}),
        ...(values.gender !== "" ? { gender: values.gender } : {}),
        bloodGroup: values.bloodGroup.trim(),
        allergies: values.allergies.trim(),
        emergencyContact: values.emergencyContact.trim(),
      }),
    onSuccess: (u) => {
      setUser(u);
      void qc.invalidateQueries({ queryKey: ["users", "me"] });
    },
  });

  const avatarMut = useMutation({
    mutationFn: (file: File) => uploadAccountAvatar(file),
    onSuccess: (u) => {
      setUser(u);
      void qc.invalidateQueries({ queryKey: ["users", "me"] });
    },
  });

  const err =
    saveMut.error || avatarMut.error
      ? unwrapApiErrorMessage(saveMut.error ?? avatarMut.error!)
      : null;

  const data = userQ.data;

  return (
    <AppPageShell variant="patient">
      <Container className="relative z-[1] max-w-3xl">
        <AppPageHeader
          role="patient"
          pill="Profile"
          icon={ShieldCheck}
          title="Your account"
          description="Keep your contact and health baseline details current so clinicians can coordinate care safely."
          className="mb-10"
        />

        {userQ.isPending && !data && (
          <div className="surface-app space-y-4 p-8">
            <div className="h-28 animate-pulse rounded-2xl bg-muted/70" />
            <div className="h-11 animate-pulse rounded-xl bg-muted/70" />
            <div className="h-11 animate-pulse rounded-xl bg-muted/70" />
          </div>
        )}

        {data && (
          <div className="space-y-8">
            <section
              className={cn(
                "rounded-3xl border border-white/65 bg-white/80 p-6 shadow-xl shadow-brand-500/10 backdrop-blur-xl",
                "dark:border-white/10 dark:bg-white/[0.06]",
              )}
            >
              <div className="flex flex-wrap items-center gap-6">
                <div className="relative">
                  {data.profilePictureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={data.profilePictureUrl}
                      alt=""
                      className="h-28 w-28 rounded-[1.65rem] border border-brand-100 object-cover shadow-lg dark:border-white/15"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-[1.65rem] border border-brand-200 bg-gradient-to-br from-brand-50 to-teal-50 text-3xl font-semibold text-brand-800 shadow-lg dark:border-brand-800 dark:from-brand-950 dark:to-teal-950 dark:text-brand-100">
                      {data.fullName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={avatarMut.isPending}
                    className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-xl border border-white bg-brand-gradient text-white shadow-lg transition hover:opacity-95"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) avatarMut.mutate(f);
                      e.target.value = "";
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{data.fullName}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    {data.email}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {data.emailVerified ? (
                      <span className="text-emerald-700 dark:text-emerald-400">Email verified</span>
                    ) : (
                      <span>Verify your email from the link we sent at signup.</span>
                    )}
                  </p>
                </div>
              </div>
            </section>

            <form
              onSubmit={handleSubmit((v) => saveMut.mutate(v))}
              className="space-y-10 rounded-3xl border border-white/65 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] sm:p-8"
            >
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <UserRound className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  Contact & identity
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Shown to doctors on bookings. Email changes are not supported here yet.
                </p>

                <div className="mt-8 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input id="fullName" className={FIELD} {...register("fullName", { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="Optional"
                      className={FIELD}
                      {...register("phone")}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 pt-10">
                <h2 className="text-lg font-semibold tracking-tight">Health baseline</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Helps your care team prepare before visits. You can update this anytime.
                </p>

                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of birth</Label>
                    <Input id="dob" type="date" className={FIELD} {...register("dateOfBirth")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select id="gender" className={cn("flex w-full px-4", FIELD)} {...register("gender")}>
                      <option value="">Prefer not to say</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="blood">Blood group</Label>
                    <select id="blood" className={cn("flex w-full px-4", FIELD)} {...register("bloodGroup")}>
                      <option value="">Not specified</option>
                      <option value="A+">A+</option>
                      <option value="A-">A−</option>
                      <option value="B+">B+</option>
                      <option value="B-">B−</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB−</option>
                      <option value="O+">O+</option>
                      <option value="O-">O−</option>
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="allergies">Allergies &amp; reactions</Label>
                    <textarea
                      id="allergies"
                      rows={4}
                      placeholder="e.g. penicillin — rash"
                      className={TEXTAREA}
                      {...register("allergies")}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="ec">Emergency contact (phone)</Label>
                    <Input
                      id="ec"
                      type="tel"
                      inputMode="tel"
                      placeholder="Someone we can reach if needed"
                      className={FIELD}
                      maxLength={20}
                      {...register("emergencyContact")}
                    />
                  </div>
                </div>
              </div>

              {err && (
                <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {err}
                </p>
              )}
              {saveMut.isSuccess && !saveMut.isPending && !err && (
                <p className="text-sm font-medium text-brand-700 dark:text-brand-400">Changes saved.</p>
              )}

              <Button
                type="submit"
                className="rounded-full bg-brand-gradient px-8 hover:opacity-95"
                disabled={saveMut.isPending || avatarMut.isPending}
              >
                {saveMut.isPending ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </div>
        )}
      </Container>
    </AppPageShell>
  );
}
