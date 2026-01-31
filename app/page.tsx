import { ScraperInterface } from "@/components/scraper-interface";
import { ModeToggle } from "@/components/mode-toggle";
import { InteractiveBackground } from "@/components/interactive-background";

export default function Page() {
  return (
    <main className="min-h-screen relative p-6 space-y-12 bg-background selection:bg-primary/20">
      <InteractiveBackground />

      {/* Absolute Corners Navigation */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-2 group cursor-default select-none">
        <div className="relative size-12 flex items-center justify-center">
          {/* Subtle logo backglow */}
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-700" />
          
          <div className="relative size-full rounded-2xl bg-secondary/50 backdrop-blur-xl border border-border/40 shadow-sm flex items-center justify-center transition-all duration-500 group-hover:border-primary group-hover:bg-secondary/80">
            <span className="text-foreground font-black text-2xl transition-all duration-500 group-hover:text-primary italic">K</span>
          </div>
        </div>
      </div>

      <ModeToggle className="absolute top-6 right-6 z-50" />

      <ScraperInterface />
    </main>
  );
}