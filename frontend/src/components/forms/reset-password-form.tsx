"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordPost } from "@/lib/api/auth";
import { ApiRequestError } from "@/lib/api/errors";

const pwd = z
  .string()
  .min(8)
  .max(100)
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d).+$/,
    "At least one letter and one digit (8+ characters)",
  );

const schema = z
  .object({
    password: pwd,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords must match",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  async function onSubmit(values: FormValues) {
    if (!token) {
      setFormError("Reset link is missing or invalid.");
      return;
    }
    setFormError(null);
    try {
      await resetPasswordPost(token, values.password);
      setDone(true);
    } catch (e) {
      if (e instanceof ApiRequestError) {
        setFormError(e.message);
      } else {
        setFormError("Could not reset password. Please try again.");
      }
    }
  }

  if (!token) {
    return (
      <p className="mt-8 text-center text-sm text-destructive">
        This page needs a valid token in the link from your email.
      </p>
    );
  }

  if (done) {
    return (
      <div className="mt-8 space-y-4 text-center text-sm text-muted-foreground">
        <p>Your password has been updated. You can sign in with the new one.</p>
        <Button asChild className="w-full">
          <Link href="/login">Go to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
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
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input
          id="confirm"
          type="password"
          autoComplete="new-password"
          {...register("confirm")}
        />
        {errors.confirm && (
          <p className="text-xs text-destructive">{errors.confirm.message}</p>
        )}
      </div>
      {formError && (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Set new password"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        <Link href="/login" className="font-semibold hover:underline">
          ← Back to login
        </Link>
      </p>
    </form>
  );
}
