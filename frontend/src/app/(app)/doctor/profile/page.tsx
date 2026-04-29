"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchMyDoctorProfile,
  updateMyDoctorProfile,
} from "@/lib/api/doctors";

interface FormVals {
  specialization: string;
  qualifications: string;
  yearsExperience: string;
  consultationFee: string;
  bio: string;
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
    });
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: updateMyDoctorProfile,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["doctor", "me"] }),
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
    });
  }

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-bold tracking-tight">Professional profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Update how patients see your practice (name / phone stays under Account).
      </p>

      {isLoading && !data && (
        <p className="mt-8 text-muted-foreground">Loading…</p>
      )}

      {data && (
        <form
          className="mt-10 max-w-xl space-y-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input id="specialization" {...register("specialization")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qualifications">Qualifications</Label>
            <Input id="qualifications" {...register("qualifications")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="years">Years experience</Label>
              <Input
                id="years"
                type="number"
                min={0}
                max={80}
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
                {...register("consultationFee")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              rows={4}
              className="flex w-full rounded-2xl border border-border/80 bg-white/80 px-4 py-3 text-sm dark:bg-white/[0.06]"
              {...register("bio")}
            />
          </div>
          {mutation.isError && (
            <p className="text-sm text-destructive">Could not save changes.</p>
          )}
          {mutation.isSuccess && (
            <p className="text-sm text-brand-700 dark:text-brand-400">
              Saved.
            </p>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save profile"}
          </Button>
        </form>
      )}
    </Container>
  );
}
