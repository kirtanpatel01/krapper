'use client'

import { Badge } from "@/components/ui/badge";

interface ResultsHeaderProps {
  jobsCount: number;
  loading: boolean;
  startIndex: number;
  pageSize: number;
}

export function ResultsHeader({ jobsCount, loading, startIndex, pageSize }: ResultsHeaderProps) {
  return (
    <div className="p-4 border-b flex justify-between items-center bg-muted/10">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Live Results</h2>
          {loading && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 animate-pulse text-[9px] h-4 py-0">
              Streaming...
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground/60 font-medium">
          Showing {startIndex + 1}-{Math.min(startIndex + pageSize, jobsCount)} of {jobsCount}
        </p>
      </div>
      <Badge variant="outline" className="font-mono">{jobsCount} total</Badge>
    </div>
  );
}
