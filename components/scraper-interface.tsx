"use client";

import { useState } from "react";
import { InputArea } from "@/components/input-area";
import { OutputArea } from "@/components/output-area";

export function ScraperInterface() {
  const [url, setUrl] = useState<string | null>(null);

  const handleScrape = (submittedUrl: string) => {
    setUrl(submittedUrl);
    console.log("Scraping:", submittedUrl);
  };

  const handleReset = () => {
    setUrl(null);
  };

  return (
    <section className="max-w-7xl mx-auto flex border border-dashed border-border rounded-xl min-h-[calc(100vh-3rem)] divide-dashed divide-x divide-border">
      <InputArea onScrape={handleScrape} onReset={handleReset} />
      <OutputArea url={url} />
    </section>
  );
}
