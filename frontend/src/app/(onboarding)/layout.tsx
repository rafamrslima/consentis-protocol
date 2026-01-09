import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#140E3A]">
      <header className="border-border border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Consentis</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground text-sm">
              Researcher Profile
            </span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/shared">Records</Link>
          </Button>
        </div>
      </header>
      {children}
    </div>
  );
}
