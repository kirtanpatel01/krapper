'use client'

import { useState, useRef, useEffect } from "react";
import { InputArea } from "@/components/input-area";
import { OutputArea } from "@/components/output-area";
import { ScrapedJob } from "@/lib/scraper-logic";
import { useScraperStore } from "@/lib/store";
import { toast } from "sonner";

interface ScraperInterfaceProps {
  initialUsage?: number;
}

export function ScraperInterface({ initialUsage = 0 }: ScraperInterfaceProps) {
  const { setJobs, addJobs, setLoading, setQuery, setUsage, reset } = useScraperStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setQuery("");
    setUsage({ count: initialUsage });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [initialUsage, setJobs, setQuery, setUsage]);

  const handleScrape = async (
    submittedQuery: string, 
    maxPages: number = 1, 
    apiKey?: string, 
    superProxy: boolean = false
  ) => {
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const newController = new AbortController();
    abortControllerRef.current = newController;

    setQuery(submittedQuery);
    setLoading(true);
    setJobs([]);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: submittedQuery, 
          maxPages, 
          apiKey, 
          superProxy 
        }),
        signal: newController.signal,
      });

      if (!response.ok) {
        let errorMessage = `Failed to start scrape: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error("No response body received");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            // Check for error sent through the stream
            if (data.error) {
              toast.error(data.error);
              setLoading(false);
              return; // Stop processing and exit function
            }

            const newJobs = data as ScrapedJob[];
            if (Array.isArray(newJobs) && newJobs.length > 0) {
              addJobs(newJobs);
              accumulatedCount += newJobs.length;
            }
          } catch (e: any) {
             // Silently ignore parsing errors for partial chunks
          }
        }
      }

      toast.success(`Scrape complete! Found ${accumulatedCount} jobs.`);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      toast.error(err.message || "A network error occurred.");
    } finally {
      if (abortControllerRef.current === newController) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <section className="max-w-5xl mx-auto flex border border-dashed border-border rounded-xl h-full divide-dashed divide-x divide-border overflow-hidden bg-background/50 backdrop-blur-md inset-shadow-sm inset-shadow-primary/5">
      <InputArea 
        onScrape={handleScrape} 
        onReset={handleReset} 
      />
      <OutputArea />
    </section>
  );
}
