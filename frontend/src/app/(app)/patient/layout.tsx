import { RequireRole } from "@/components/auth/require-role";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireRole role="PATIENT">{children}</RequireRole>;
}
