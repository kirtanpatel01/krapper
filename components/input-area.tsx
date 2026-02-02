'use client'

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


import { ApiKeyField } from "./input-area/api-key-field";
import { QueryField } from "./input-area/query-field";
import { SmartScrapingToggle } from "./input-area/smart-scraping-toggle";
import { DeepScrapeToggle } from "./input-area/deep-scrape-toggle";
import { PageCounter } from "./input-area/page-counter";
import OutputAreaDialog from "./output-area-dialog";
import { useScraperStore } from "@/lib/store";

const API_KEY_REGEX = /^[a-f0-9]{30,}$/i;

interface InputAreaProps {
  onScrape: (query: string, maxPages: number, apiKey?: string, superProxy?: boolean) => void;
  onReset: () => void;
}

export function InputArea({ onScrape, onReset }: InputAreaProps) {
  const { usage, setUsage, query, jobs, loading } = useScraperStore();
  const inputRef = useRef<HTMLInputElement>(null);
  

  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isDeepScrape, setIsDeepScrape] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [isSmartScraping, setIsSmartScraping] = useState(false);


  const hasCustomKey = API_KEY_REGEX.test(apiKey.trim());
  const isUsageLimitReached = usage.count >= usage.limit && !hasCustomKey;


  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = query;
    }
  }, [query]);


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
      setUsage({ count: usage.count + 1 });
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
        
        <ApiKeyField 
          apiKey={apiKey} 
          setApiKey={setApiKey} 
          showApiKey={showApiKey} 
          setShowApiKey={setShowApiKey} 
          hasCustomKey={hasCustomKey}
          usage={usage}
        />

        <QueryField 
          inputRef={inputRef} 
          isUsageLimitReached={isUsageLimitReached} 
        />

        <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border/50">
          <SmartScrapingToggle 
            isActive={isSmartScraping} 
            onToggle={() => setIsSmartScraping(!isSmartScraping)} 
            isDisabled={!hasCustomKey} 
          />

          <div className="h-px bg-border/40" />

          <DeepScrapeToggle 
            isActive={isDeepScrape} 
            onToggle={() => setIsDeepScrape(!isDeepScrape)} 
            isDisabled={!hasCustomKey} 
          />

          {isDeepScrape && hasCustomKey ? (
            <PageCounter pageCount={pageCount} setPageCount={setPageCount} />
          ) : null}
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button 
            type="submit" 
            disabled={isUsageLimitReached}
            className={`flex-1 hidden lg:flex cursor-pointer inset-shadow-sm h-11 transition-all ${isUsageLimitReached ? 'bg-muted text-muted-foreground grayscale cursor-not-allowed' : 'bg-primary'}`}
          >
            {isUsageLimitReached ? 'Limit Reached' : 'Scrape'}
          </Button>
          <OutputAreaDialog 
            isUsageLimitReached={isUsageLimitReached}
          />
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
