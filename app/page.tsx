import { ScraperInterface } from "@/components/scraper-interface";
import { ModeToggle } from "@/components/mode-toggle";
import { InteractiveBackground } from "@/components/interactive-background";
import { headers } from "next/headers";
import { getFingerprint, getUsage } from "@/lib/auth";

export default async function Page() {
  const headerList = await headers();
  const fid = getFingerprint(headerList);
  const initialUsage = await getUsage(fid);

  return (
    <main className="h-screen relative flex flex-col p-6 bg-background selection:bg-primary/20 overflow-hidden">
      <InteractiveBackground />

      <div className="absolute top-6 left-6 flex items-center gap-2 group cursor-default select-none">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-700" />

          <div className="relative size-full rounded-lg bg-secondary/50 backdrop-blur-xl border border-border/40 shadow-sm flex items-center justify-center transition-all duration-500 group-hover:border-primary group-hover:bg-secondary/80 px-3 py-1">
            <span className="text-foreground font-black text-2xl transition-all duration-700 group-hover:text-primary italic">Krapper</span>
          </div>
        </div>
      </div>
      <ModeToggle className="absolute top-6 right-6" />

      <div className="flex-1 min-h-0">
        <ScraperInterface initialUsage={initialUsage} />
      </div>
    </main>
  );
}