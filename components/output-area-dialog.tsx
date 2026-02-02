'use client'

import { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { ResultsHeader } from './output-area/results-header'
import { JobCard } from './output-area/job-card'
import { RiLoader2Line } from '@remixicon/react'
import { JobsPagination } from './output-area/jobs-pagination'
import { LoadingState } from './output-area/loading-state'
import { EmptyState } from './output-area/empty-state'
import { useScraperStore } from '@/lib/store'

interface OutputAreaDialogProps {
  isUsageLimitReached: boolean;
}

function OutputAreaDialog({
  isUsageLimitReached
}: OutputAreaDialogProps) {
  const { jobs, loading, query } = useScraperStore();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useMemo(() => {
    setCurrentPage(1);
  }, [jobs]);

  const totalPages = Math.ceil(jobs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentJobs = jobs.slice(startIndex, startIndex + pageSize);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="submit"
          disabled={isUsageLimitReached}
          className={`flex-1 lg:hidden cursor-pointer inset-shadow-sm h-11 transition-all ${
            isUsageLimitReached 
              ? 'bg-muted text-muted-foreground grayscale cursor-not-allowed' 
              : 'bg-primary'
          }`}
        >
          Scrape
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold italic text-primary">Krapper Results</DialogTitle>
          <ResultsHeader
            jobsCount={jobs.length}
            loading={loading}
            startIndex={startIndex}
            pageSize={pageSize}
          />
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          {loading && jobs.length === 0 ? (
            <LoadingState />
          ) : jobs.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Floating Pagination */}
        {totalPages > 1 ? (
          <div className="p-4 border-t bg-background/50 backdrop-blur-md">
            <JobsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default OutputAreaDialog;