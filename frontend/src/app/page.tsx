import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="bg-background relative min-h-screen w-full overflow-hidden">
      <div className="relative z-10 container mx-auto flex min-h-screen flex-col items-center justify-center px-6 pt-32 text-center">
        <span className="bg-secondary/50 border-border text-primary mb-6 inline-block rounded-full border px-3 py-1 text-sm font-medium">
          SECURE &bull; DECENTRALIZED &bull; HIPAA-COMPLIANT
        </span>

        <h1 className="text-foreground mb-6 text-5xl font-bold tracking-tight md:text-7xl">
          Consentis Protocol
        </h1>

        <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-xl">
          Decentralized health data protocol. Own your medical records with
          blockchain-powered consent management.
        </p>

        <Link href="/connect">
          <Button
            size="lg"
            className="bg-medical-gradient text-primary-foreground rounded-xl px-10 py-4 font-bold shadow-[0_0_30px_-5px_rgba(20,184,166,0.4)] transition-all hover:opacity-90"
          >
            Get Started
          </Button>
        </Link>
      </div>
    </section>
  );
}
