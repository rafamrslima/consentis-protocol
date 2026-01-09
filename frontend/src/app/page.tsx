import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <section
      className="bg-background relative min-h-screen w-full overflow-hidden bg-contain bg-left bg-no-repeat"
      style={{ backgroundImage: "url('/bg-left.png')" }}
    >
      <div className="relative z-10 container mx-auto flex min-h-screen max-w-6xl items-center px-6">
        <div className="grid w-full grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="text-left">
            <span className="bg-secondary/50 border-border text-primary mb-6 inline-block rounded-full border px-3 py-1 text-sm font-medium">
              EARN TOKENS &bull; ADVANCE RESEARCH &bull; STAY IN CONTROL
            </span>

            <h1 className="text-foreground mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Own Your Data. Earn From It.
            </h1>

            <p className="text-muted-foreground mb-8 max-w-xl text-lg">
              Researchers need data. You have it. Get compensated while
              advancing medicine—on your terms.
            </p>

            <Link href="/connect">
              <Button
                size="lg"
                className="bg-medical-gradient hover:bg-medical-gradient text-primary-foreground rounded-xl px-12 py-6 text-lg font-bold transition-all hover:opacity-90"
              >
                Start Earning
              </Button>
            </Link>
          </div>

          <div className="flex justify-center">
            <Image
              src="/earn-by-sharing-data.png"
              alt="Earn by sharing data"
              width={500}
              height={500}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
