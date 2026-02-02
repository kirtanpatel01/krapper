'use client'

import { useState, useMemo } from "react";
import { ScrapedJob } from "@/lib/scraper-logic";
import { RiLoader2Line } from "@remixicon/react";

// Sub-components
import { ResultsHeader } from "./output-area/results-header";
import { JobCard } from "./output-area/job-card";
import { EmptyState } from "./output-area/empty-state";
import { LoadingState } from "./output-area/loading-state";
import { JobsPagination } from "./output-area/jobs-pagination";

interface OutputAreaProps {
  jobs: ScrapedJob[];
  loading: boolean;
  query: string;
}

export function OutputArea({ jobs, loading, query }: OutputAreaProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Reset page when jobs change
  useMemo(() => {
    setCurrentPage(1);
  }, [jobs]);

  const totalPages = Math.ceil(jobs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentJobs = jobs.slice(startIndex, startIndex + pageSize);

  // Initial loading state (no jobs yet)
  if (loading && jobs.length === 0) {
    return <LoadingState />;
  }

  // Empty state (no results or before search)
  if (jobs.length === 0) {
    return <EmptyState query={query} />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Top bar with stats */}
      <ResultsHeader 
        jobsCount={jobs.length} 
        loading={loading}
        startIndex={startIndex} 
        pageSize={pageSize} 
      />

      {/* Main scrollable list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {currentJobs.map((job, index) => (
          <JobCard key={index} job={job} />
        ))}

        {/* Inline loader for streaming */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground/60 italic text-xs animate-in fade-in duration-500">
            <RiLoader2Line className="size-3 animate-spin" />
            Gathering more jobs...
          </div>
        ) : null}
      </div>

      {/* Floating Pagination */}
      {totalPages > 1 ? (
        <JobsPagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          setCurrentPage={setCurrentPage} 
        />
      ) : null}
    </div>
  );
}
