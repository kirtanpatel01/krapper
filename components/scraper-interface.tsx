'use client'

import { useState, useRef, useEffect } from "react";
import { InputArea } from "@/components/input-area";
import { OutputArea } from "@/components/output-area";
import { ScrapedJob } from "@/lib/scraper-logic";
import { toast } from "sonner";

interface ScraperInterfaceProps {
  initialUsage?: number;
}

export function ScraperInterface({ initialUsage = 0 }: ScraperInterfaceProps) {
  const [jobs, setJobs] = useState<ScrapedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
              setJobs(prev => {
                const existingKeys = new Set(prev.map(j => j.jobUrl));
                const uniqueNewJobs = newJobs.filter(j => !existingKeys.has(j.jobUrl));
                return [...prev, ...uniqueNewJobs];
              });
              accumulatedCount += newJobs.length;
            }
          } catch (e: any) {
            console.error("Error parsing stream chunk:", e);
          }
        }
      }

      toast.success(`Scrape complete! Found ${accumulatedCount} jobs.`);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Scrape request aborted');
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
    setJobs([]);
    setLoading(false);
    setQuery("");
  };

  return (
    <section className="max-w-5xl mx-auto flex border border-dashed border-border rounded-xl h-full divide-dashed divide-x divide-border overflow-hidden bg-background/50 backdrop-blur-md inset-shadow-sm inset-shadow-primary/5">
      <InputArea onScrape={handleScrape} onReset={handleReset} initialUsage={initialUsage} />
      <OutputArea jobs={jobs} loading={loading} query={query} />
    </section>
  );
}
