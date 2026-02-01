'use client'

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { 
  RiAddLine, 
  RiSubtractLine, 
  RiKey2Line, 
  RiEyeLine, 
  RiEyeOffLine, 
  RiInformationLine,
  RiShieldFlashLine,
  RiLockLine,
  RiGlobalLine
} from "@remixicon/react";
import { Badge } from "./ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface InputAreaProps {
  onScrape: (query: string, maxPages: number, apiKey?: string, superProxy?: boolean) => void;
  onReset: () => void;
  initialUsage?: number;
}

export function InputArea({ onScrape, onReset, initialUsage = 0 }: InputAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDeepScrape, setIsDeepScrape] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSmartScraping, setIsSmartScraping] = useState(false);
  const [usage, setUsage] = useState({ count: initialUsage, limit: 3 });

  const inputId = "job-input";
  
  // ROBUST VALIDATION: Scrape.do tokens are hexadecimal and typically ~43 chars.
  // We'll require at least 30 hex characters to consider it a "custom key" bypass.
  const hasCustomKey = /^[a-f0-9]{30,}$/i.test(apiKey.trim());
  const isUsageLimitReached = usage.count >= usage.limit && !hasCustomKey;

  // Sync with initialUsage only once on mount to establish server-sent state
  useEffect(() => {
    setUsage(prev => ({ ...prev, count: initialUsage }));
  }, [initialUsage]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = inputRef.current?.value.trim() || "";

    if (!query) {
      toast.error("Please enter a job title or keyword");
      return;
    }

    if (isUsageLimitReached) {
      toast.error("Free limit reached. Please provide a valid Scrape.do API key.");
      return;
    }

    onScrape(
      query, 
      hasCustomKey ? (isDeepScrape ? pageCount : 1) : 1, 
      apiKey, 
      isSmartScraping
    );
    
    // Optimistically increment usage for free users
    if (!hasCustomKey) {
      setUsage(prev => ({ ...prev, count: prev.count + 1 }));
    }
  };

  const handleResetAction = () => {
    if (inputRef.current) inputRef.current.value = "";
    setIsDeepScrape(false);
    setIsSmartScraping(false);
    setPageCount(1);
    onReset();
    inputRef.current?.focus();
  };

  const incrementPage = () => setPageCount(prev => Math.min(50, prev + 1));
  const decrementPage = () => setPageCount(prev => Math.max(1, prev - 1));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex-1 flex justify-center items-center">
      <form onSubmit={handleSubmit} className="grid w-full max-w-sm gap-6 p-6">
        {/* Custom API Key Section */}
        <Field>
          <div className="flex items-center justify-between mb-2">
            <FieldLabel htmlFor="api-key" className="text-muted-foreground/70 font-medium">Custom Scrape.do API Key</FieldLabel>
            {hasCustomKey ? (
              <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">UNLOCKED</Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-muted-foreground/50 italic">FREE: {Math.max(0, usage.limit - usage.count)} left</Badge>
            )}
          </div>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <RiKey2Line className={`size-4 transition-colors ${hasCustomKey ? 'text-green-500' : 'text-muted-foreground/50'}`} />
            </InputGroupAddon>
            <InputGroupInput
              id="api-key"
              type={showApiKey ? "text" : "password"}
              placeholder="Paste Scrape.do Token"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="px-4!"
            />
            <InputGroupAddon align="inline-end">
              <button 
                type="button" 
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-1 hover:text-foreground transition-colors"
              >
                {showApiKey ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
              </button>
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <Field>
          <FieldLabel htmlFor={inputId} className="text-muted-foreground/70 mb-2 font-medium">Job Title or Keyword</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id={inputId}
              ref={inputRef}
              disabled={isUsageLimitReached}
              placeholder={isUsageLimitReached ? "Limit Reached 🛑" : "e.g., Frontend Developer"}
              className="px-4!"
            />
            <InputGroupAddon align="inline-end">
              <KbdGroup>
                <Kbd>Ctrl</Kbd>
                <span>+</span>
                <Kbd>/</Kbd>
              </KbdGroup>
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border/50">
          {/* Smart Scraping Toggle */}
          <div className="flex items-center justify-between">
            <div 
              className={`flex items-center gap-2 transition-all ${hasCustomKey ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`} 
              onClick={() => hasCustomKey && setIsSmartScraping(!isSmartScraping)}
            >
              <div className={`size-5 rounded border transition-all flex items-center justify-center ${isSmartScraping ? 'bg-primary border-primary' : 'bg-background border-border'}`}>
                {isSmartScraping && <RiShieldFlashLine className="size-3 text-primary-foreground" />}
              </div>
              <label className={`text-sm font-medium select-none flex items-center gap-1.5 ${hasCustomKey ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                Smart Scraping
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <RiInformationLine 
                        className="size-3.5 text-muted-foreground hover:text-primary transition-colors" 
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <div className="space-y-1.5">
                        <p>
                          {isSmartScraping 
                            ? "Smart Scraping (Super Proxy) uses elite proxies to bypass heavy blocks. It costs 10 credits per page." 
                            : "Standard Scraping uses high-quality datacenter/residential proxies. It costs 1 credit per page."}
                        </p>
                        {!hasCustomKey && (
                          <div className="mt-2 text-amber-500 font-bold border-t border-amber-500/10 pt-1 flex items-center gap-1">
                            <RiLockLine className="size-3" /> Requires Valid API Key
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
            </div>
            <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${isSmartScraping ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : (hasCustomKey ? 'text-primary' : 'text-primary/30')}`}>
              {isSmartScraping ? '10 credits/page' : '1 credit/page'}
            </Badge>
          </div>

          <div className="h-px bg-border/40" />

          {/* Pagination Toggle */}
          <div className="flex items-center justify-between">
            <div 
              className={`flex items-center gap-2 transition-all ${hasCustomKey ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`} 
              onClick={() => hasCustomKey && setIsDeepScrape(!isDeepScrape)}
            >
              <div className={`size-4 rounded border transition-all flex items-center justify-center ${isDeepScrape ? 'bg-primary border-primary' : 'bg-background border-border'}`}>
                {isDeepScrape && <div className="size-1.5 bg-primary-foreground rounded-full" />}
              </div>
              <label className={`text-sm font-medium select-none flex items-center gap-1.5 ${hasCustomKey ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                Deep Scrape
                {!hasCustomKey && (
                  <span className="flex items-center gap-0.5 text-[9px] bg-secondary/80 px-1 py-0.5 rounded text-muted-foreground border border-border/40 font-bold">
                    LOCKED
                  </span>
                )}
              </label>
            </div>
            {isDeepScrape && hasCustomKey && (
               <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 animate-in zoom-in-95 duration-200">
                  <RiGlobalLine className="size-3 text-primary" />
                  <span className="text-[10px] font-bold text-primary">MULTI-PAGE</span>
               </div>
            )}
          </div>

          {isDeepScrape && hasCustomKey && (
            <Field className="w-full animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
              <FieldLabel htmlFor="page-count" className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5 flex justify-between">
                Number of Pages
                <span className="font-mono">{pageCount * 15} jobs target</span>
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="size-8"
                    onClick={decrementPage}
                  >
                    <RiSubtractLine className="size-4" />
                  </Button>
                </InputGroupAddon>
                <Input
                  id="page-count"
                  type="number"
                  min={1}
                  max={50}
                  value={pageCount}
                  onChange={(e) => setPageCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="bg-background text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <InputGroupAddon align="inline-end">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="size-8"
                    onClick={incrementPage}
                  >
                    <RiAddLine className="size-4" />
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button 
            type="submit" 
            disabled={isUsageLimitReached}
            className={`flex-1 cursor-pointer inset-shadow-sm h-11 transition-all ${isUsageLimitReached ? 'bg-muted text-muted-foreground grayscale cursor-not-allowed' : 'bg-primary'}`}
          >
            {isUsageLimitReached ? 'Limit Reached' : 'Scrape'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleResetAction}
            className="cursor-pointer inset-shadow-sm inset-shadow-primary/5 h-11"
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
