import { RequireRole } from "@/components/auth/require-role";
import { RoleAppNav } from "@/components/app/role-app-nav";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole role="PATIENT">
      <RoleAppNav variant="patient" />
      {children}
    </RequireRole>
  );
}
