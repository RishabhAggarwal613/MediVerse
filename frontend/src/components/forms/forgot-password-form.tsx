"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordPost } from "@/lib/api/auth";
import { ApiRequestError } from "@/lib/api/errors";

const schema = z.object({
  email: z.string().email().max(180),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await forgotPasswordPost(values.email);
      setDone(true);
    } catch (e) {
      if (e instanceof ApiRequestError) {
        setFormError(e.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    }
  }

  if (done) {
    return (
      <div className="mt-8 space-y-4 text-center text-sm text-muted-foreground">
        <p>
          If an account exists for that email, we sent reset instructions.
          Check your inbox (and spam).
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
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
      {formError && (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        <Link href="/login" className="font-semibold hover:underline">
          ← Back to login
        </Link>
      </p>
    </form>
  );
}
