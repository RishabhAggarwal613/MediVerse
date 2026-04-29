"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DoctorRegistrationPayload } from "@/lib/api/auth";
import { registerDoctor } from "@/lib/api/auth";
import { ApiRequestError } from "@/lib/api/errors";
import { dashboardPath } from "@/lib/nav";
import { useAuthStore } from "@/stores/auth-store";

const pwd = z
  .string()
  .min(8)
  .max(100)
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d).+$/,
    "At least one letter and one digit (8+ characters)",
  );

const schema = z.object({
  email: z.string().email().max(180),
  password: pwd,
  fullName: z.string().min(1).max(120),
  phone: z.string().max(20).optional().or(z.literal("")),
  specialization: z.string().min(1).max(80),
  qualifications: z.string().max(255).optional().or(z.literal("")),
  licenseNumber: z.string().min(1).max(80),
  yearsExperience: z.union([z.string(), z.number()]).optional(),
  consultationFee: z.union([z.string(), z.number()]).optional(),
  bio: z.string().max(2000).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

function normalizePayload(values: FormValues): DoctorRegistrationPayload {
  const yearsRaw = values.yearsExperience;
  const yearsNum =
    yearsRaw === "" || yearsRaw === undefined || yearsRaw === null
      ? undefined
      : typeof yearsRaw === "number"
        ? yearsRaw
        : Number.parseInt(String(yearsRaw), 10);
  const yearsExperience =
    yearsNum !== undefined &&
    Number.isFinite(yearsNum) &&
    !Number.isNaN(yearsNum)
      ? Math.min(80, Math.max(0, yearsNum))
      : undefined;

  const feeRaw = values.consultationFee;
  let consultationFee: number | undefined;
  if (feeRaw !== "" && feeRaw !== undefined && feeRaw !== null) {
    const n =
      typeof feeRaw === "number" ? feeRaw : Number.parseFloat(String(feeRaw));
    if (Number.isFinite(n) && !Number.isNaN(n)) consultationFee = n;
  }

  const phone = values.phone?.trim();
  const qualifications = values.qualifications?.trim();
  const bio = values.bio?.trim();

  return {
    email: values.email.trim(),
    password: values.password,
    fullName: values.fullName.trim(),
    ...(phone ? { phone } : {}),
    specialization: values.specialization.trim(),
    ...(qualifications ? { qualifications } : {}),
    licenseNumber: values.licenseNumber.trim(),
    ...(yearsExperience !== undefined ? { yearsExperience } : {}),
    ...(consultationFee !== undefined ? { consultationFee } : {}),
    ...(bio ? { bio } : {}),
  };
}

export function DoctorSignupForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [formError, setFormError] = useState<string | null>(null);
  const licenseRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      phone: "",
      specialization: "",
      qualifications: "",
      licenseNumber: "",
      yearsExperience: "",
      consultationFee: "",
      bio: "",
    },
  });

  async function onSubmit(values: FormValues) {
    const file = licenseRef.current?.files?.[0];
    if (!file) {
      setFormError("Please upload your medical license document.");
      return;
    }

    setFormError(null);

    try {
      const payload = normalizePayload(values);
      const auth = await registerDoctor(payload, file);
      setSession(auth);
      router.replace(dashboardPath(auth.user.role));
    } catch (e) {
      if (e instanceof ApiRequestError) {
        setFormError(e.message);
      } else {
        setFormError("Could not submit your registration. Please try again.");
      }
    }
  }

  return (
    <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" autoComplete="name" {...register("fullName")} />
          {errors.fullName && (
            <p className="text-xs text-destructive">
              {errors.fullName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" type="tel" {...register("phone")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input id="specialization" {...register("specialization")} />
          {errors.specialization && (
            <p className="text-xs text-destructive">
              {errors.specialization.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearsExperience">
            Years of experience (optional)
          </Label>
          <Input
            id="yearsExperience"
            type="number"
            min={0}
            max={80}
            {...register("yearsExperience")}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="qualifications">Qualifications (optional)</Label>
          <Input id="qualifications" {...register("qualifications")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="licenseNumber">License number</Label>
          <Input id="licenseNumber" {...register("licenseNumber")} />
          {errors.licenseNumber && (
            <p className="text-xs text-destructive">
              {errors.licenseNumber.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="consultationFee">Consultation fee (optional)</Label>
          <Input
            id="consultationFee"
            inputMode="decimal"
            placeholder="e.g. 150.00"
            {...register("consultationFee")}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bio">Bio (optional)</Label>
          <textarea
            id="bio"
            rows={4}
            className="flex w-full rounded-2xl border border-border/80 bg-white/80 px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:bg-white/[0.06]"
            {...register("bio")}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="license">License document</Label>
          <Input
            id="license"
            ref={licenseRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
          />
          <p className="text-xs text-muted-foreground">
            PDF or image of your practicing license for verification.
          </p>
        </div>
      </div>

      {formError && (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit for verification"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/signup" className="font-semibold hover:underline">
          ← Change role
        </Link>
        {" · "}
        <Link
          href="/login"
          className="font-semibold text-brand-700 hover:underline dark:text-brand-300"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
