import { ScraperInterface } from "@/components/scraper-interface";
import { ModeToggle } from "@/components/mode-toggle";
import { InteractiveBackground } from "@/components/interactive-background";
import { headers } from "next/headers";
import { getFingerprint, getUsage } from "@/lib/auth";
import Image from "next/image";

export default async function Page() {
  const headerList = await headers();
  const fid = getFingerprint(headerList);
  const initialUsage = await getUsage(fid);

  return (
    <main className="h-screen flex flex-col gap-4 p-4 bg-background selection:bg-primary/20 overflow-hidden">
      <InteractiveBackground />

      <header className="w-full flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-default select-none">
          <div className="relative flex items-center justify-center gap-2">
            <Image src="/krapper-logo-square-bg.svg" alt="Krapper Logo" width={44} height={44} />
            <div className="relative size-full rounded-lg bg-secondary/50 backdrop-blur-xl border border-border/40 shadow-sm flex items-center justify-center transition-all duration-500 group-hover:border-primary group-hover:bg-secondary/80 px-3 py-1">
              <h1 className="text-foreground font-black text-2xl transition-all duration-700 group-hover:text-primary italic">Krapper</h1>
            </div>
          </div>
        </div>
        <ModeToggle />
      </header>

      <div className="flex-1 min-h-0">
        <ScraperInterface initialUsage={initialUsage} />
      </div>
    </main>
  );
}