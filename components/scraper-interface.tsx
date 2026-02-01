"use client";

import { useState } from "react";
import { InputArea } from "@/components/input-area";
import { OutputArea } from "@/components/output-area";
import { scrapeAction } from "@/app/actions/scrape";
import { ScrapedJob } from "@/lib/scraper-logic";
import { toast } from "sonner";

export function ScraperInterface() {
  const [jobs, setJobs] = useState<ScrapedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const handleScrape = async (submittedQuery: string) => {
    setQuery(submittedQuery);
    setLoading(true);
    setJobs([]);

    try {
      const result = await scrapeAction(submittedQuery);
      if (result.success && result.data) {
        setJobs(result.data);
        toast.success(`Successfully scraped ${result.data.length} jobs!`);
      } else {
        toast.error(result.error || "Failed to scrape jobs.");
      }
    } catch (err) {
      toast.error("A network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJobs([]);
    setLoading(false);
    setQuery("");
  };

  return (
    <section className="max-w-7xl mx-auto flex border border-dashed border-border rounded-xl h-full divide-dashed divide-x divide-border overflow-hidden bg-background/50 backdrop-blur-md inset-shadow-sm inset-shadow-primary/5">
      <InputArea onScrape={handleScrape} onReset={handleReset} />
      <OutputArea jobs={jobs} loading={loading} query={query} />
    </section>
  );
}
