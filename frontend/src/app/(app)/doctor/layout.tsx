import { RequireRole } from "@/components/auth/require-role";
import { RoleAppNav } from "@/components/app/role-app-nav";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole role="DOCTOR">
      <RoleAppNav variant="doctor" />
      {children}
    </RequireRole>
  );
}
