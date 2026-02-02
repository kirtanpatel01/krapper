'use client'

import { RiShieldFlashLine, RiInformationLine, RiLockLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface SmartScrapingToggleProps {
  isActive: boolean;
  onToggle: () => void;
  isDisabled: boolean;
}

export function SmartScrapingToggle({ 
  isActive, 
  onToggle, 
  isDisabled 
}: SmartScrapingToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div 
        className={`flex items-center gap-2 transition-all ${!isDisabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`} 
        onClick={() => !isDisabled && onToggle()}
      >
        <div className={`size-5 rounded border transition-all flex items-center justify-center ${isActive ? 'bg-primary border-primary' : 'bg-background border-border'}`}>
          {isActive ? <RiShieldFlashLine className="size-3 text-primary-foreground" /> : null}
        </div>
        <label className={`text-sm font-medium select-none flex items-center gap-1.5 ${!isDisabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
          Smart Scraping
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <RiInformationLine className="size-3.5 text-muted-foreground hover:text-primary transition-colors cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[11px] p-3 shadow-xl border-border/50 backdrop-blur-md">
                <div className="space-y-1.5">
                  <p>
                    {isActive 
                      ? "Smart Scraping (Super Proxy) uses elite proxies to bypass heavy blocks. It costs 10 credits per page." 
                      : "Standard Scraping uses high-quality datacenter/residential proxies. It costs 1 credit per page."}
                  </p>
                  {isDisabled ? (
                    <div className="mt-2 text-amber-500 font-bold border-t border-amber-500/10 pt-1 flex items-center gap-1">
                      <RiLockLine className="size-3" /> Requires Valid API Key
                    </div>
                  ) : null}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </label>
      </div>
      <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${isActive ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : (!isDisabled ? 'text-primary' : 'text-primary/30')}`}>
        {isActive ? '10 credits/page' : '1 credit/page'}
      </Badge>
    </div>
  );
}
