export default function AppAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background to-brand-50/30 dark:from-background dark:to-brand-950/20">
      {children}
    </div>
  );
}
