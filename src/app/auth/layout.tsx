export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 dark:from-neutral-950 dark:to-neutral-900">
      {children}
    </div>
  );
}
