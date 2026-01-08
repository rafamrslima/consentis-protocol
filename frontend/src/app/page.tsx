import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="bg-background relative min-h-screen w-full overflow-hidden">
      <div className="relative z-10 container mx-auto flex flex-col items-center px-6 pt-24 text-center md:pt-32">
        <span className="bg-secondary/50 border-border text-primary mb-6 inline-block rounded-full border px-3 py-1 text-sm font-medium">
          EARN TOKENS &bull; ADVANCE RESEARCH &bull; STAY IN CONTROL
        </span>

        <h1 className="text-foreground mb-6 text-5xl font-bold tracking-tight md:text-7xl">
          Own Your Data. Earn From It.
        </h1>

        <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-xl">
          Researchers need data. You have it. Get compensated while advancing
          medicine—on your terms.
        </p>

        <Link href="/connect">
          <Button
            size="lg"
            className="bg-medical-gradient text-primary-foreground cursor-pointer rounded-xl px-10 py-4 font-bold transition-all hover:opacity-90"
          >
            Start Earning
          </Button>
        </Link>
      </div>

      <Image
        src="/ilustrator.png"
        alt="Health data illustration"
        width={500}
        height={432}
        className="pointer-events-none absolute left-[48%] z-0 -translate-x-1/2 opacity-40"
        priority
      />
    </section>
  );
}
