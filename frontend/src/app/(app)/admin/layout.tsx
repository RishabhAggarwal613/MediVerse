import { AdminAppNav } from "@/components/app/admin-app-nav";
import { RequireAuth } from "@/components/auth/require-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <AdminAppNav />
      {children}
    </RequireAuth>
  );
}
