export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      <header className="border-border border-b">
        <div className="container mx-auto flex h-14 items-center px-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Consentis</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground text-sm">
              Researcher Onboarding
            </span>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
