"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerPatient } from "@/lib/api/auth";
import { ApiRequestError } from "@/lib/api/errors";
import { getGoogleOAuthUrl } from "@/lib/env";
import { dashboardPath } from "@/lib/nav";
import { useAuthStore } from "@/stores/auth-store";

const passwordRule = z
  .string()
  .min(8)
  .max(100)
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d).+$/,
    "At least one letter and one digit (8+ characters)",
  );

const schema = z.object({
  email: z.string().email().max(180),
  password: passwordRule,
  fullName: z.string().min(1).max(120),
  phone: z.string().max(20).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function PatientSignupForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [formError, setFormError] = useState<string | null>(null);

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
    },
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    const phone = values.phone?.trim();
    try {
      const auth = await registerPatient({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        ...(phone ? { phone } : {}),
      });
      setSession(auth);
      router.replace(dashboardPath(auth.user.role));
    } catch (e) {
      if (e instanceof ApiRequestError) {
        setFormError(e.message);
      } else {
        setFormError("Could not create your account. Please try again.");
      }
    }
  }

  return (
    <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" autoComplete="name" {...register("fullName")} />
        {errors.fullName && (
          <p className="text-xs text-destructive">{errors.fullName.message}</p>
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
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          {...register("phone")}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {formError && (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create patient account"}
      </Button>

      <div className="relative py-1 text-center text-xs text-muted-foreground">
        <span className="relative z-10 bg-white/80 px-2 dark:bg-background/80">
          or continue with
        </span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
      </div>

      <Button type="button" variant="outline" className="w-full" asChild>
        <a href={getGoogleOAuthUrl()}>Google</a>
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Already registered?{" "}
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
