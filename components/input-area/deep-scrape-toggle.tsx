'use client'

import { RiGlobalLine } from "@remixicon/react";

interface DeepScrapeToggleProps {
  isActive: boolean;
  onToggle: () => void;
  isDisabled: boolean;
}

export function DeepScrapeToggle({ 
  isActive, 
  onToggle, 
  isDisabled 
}: DeepScrapeToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div 
        className={`flex items-center gap-2 transition-all ${!isDisabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`} 
        onClick={() => !isDisabled && onToggle()}
      >
        <div className={`size-4 rounded border transition-all flex items-center justify-center ${isActive ? 'bg-primary border-primary' : 'bg-background border-border'}`}>
          {isActive ? <div className="size-1.5 bg-primary-foreground rounded-full" /> : null}
        </div>
        <label className={`text-sm font-medium select-none flex items-center gap-1.5 ${!isDisabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
          Deep Scrape
          {isDisabled ? (
            <span className="flex items-center gap-0.5 text-[9px] bg-secondary/80 px-1 py-0.5 rounded text-muted-foreground border border-border/40 font-bold">
              LOCKED
            </span>
          ) : null}
        </label>
      </div>
      {isActive && !isDisabled ? (
         <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 animate-in zoom-in-95 duration-200">
            <RiGlobalLine className="size-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">MULTI-PAGE</span>
         </div>
      ) : null}
    </div>
  );
}
