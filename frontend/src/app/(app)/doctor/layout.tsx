import { RequireRole } from "@/components/auth/require-role";
import { RoleAppNav } from "@/components/app/role-app-nav";
import { DoctorVerificationBanner } from "@/components/app/account-banners";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole role="DOCTOR">
      <RoleAppNav variant="doctor" />
      <DoctorVerificationBanner />
      {children}
    </RequireRole>
  );
}
