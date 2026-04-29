import type { Metadata } from "next";

import { OAuthCallbackClient } from "@/components/auth/oauth-callback-client";

export const metadata: Metadata = {
  title: "Signing in",
  description: "Completing Google OAuth for MediVerse.",
};

export default function OAuthCallbackPage() {
  return <OAuthCallbackClient />;
}
