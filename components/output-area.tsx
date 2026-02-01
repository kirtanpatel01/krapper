'use client'

import { useState, useMemo } from "react";
import { ScrapedJob } from "@/lib/scraper-logic";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  CardAction 
} from "@/components/ui/card";
import { 
  RiLoader2Line, 
  RiExternalLinkLine, 
  RiMapPin2Line, 
  RiBuilding2Line, 
  RiTimeLine,
  RiBriefcaseLine
} from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Empty, 
  EmptyHeader, 
  EmptyMedia, 
  EmptyTitle, 
  EmptyDescription 
} from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

  if (loading && jobs.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-muted/20 gap-3">
        <RiLoader2Line className="size-6 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground font-medium">Searching Indeed...</span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <Empty className="flex-1">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <RiBriefcaseLine className="size-5" />
            </EmptyMedia>
            <EmptyTitle>
              {query ? "No live results found" : "Ready to Scrape"}
            </EmptyTitle>
            <EmptyDescription>
              {query 
                ? `We couldn't find any results for "${query}". Try refining your keywords.` 
                : "Enter a job title or keyword on the left to start searching Indeed."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
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
            Showing {startIndex + 1}-{Math.min(startIndex + pageSize, jobs.length)} of {jobs.length}
          </p>
        </div>
        <Badge variant="outline" className="font-mono">{jobs.length} total</Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {currentJobs.map((job, index) => (
          <Card key={index}>
            <CardHeader>
              <CardAction>
                <Button variant="ghost" size="icon" asChild>
                  <a href={job.jobUrl || "#"} target="_blank" rel="noopener noreferrer">
                    <RiExternalLinkLine className="size-4" />
                  </a>
                </Button>
              </CardAction>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription className="flex gap-4">
                {job.company && (
                  <span className="flex items-center gap-1.5">
                    <RiBuilding2Line className="size-3.5" />
                    {job.company}
                  </span>
                )}
                {job.location && (
                  <span className="flex items-center gap-1.5">
                    <RiMapPin2Line className="size-3.5" />
                    {job.location}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-normal text-muted-foreground">
                {job.description}
              </p>
            </CardContent>
            <CardFooter className="flex gap-2 text-xs">
              {job.salary && job.salary !== 'No Salary Info' && (
                <div className="flex items-center gap-1">
                  {job.salary}
                  {job.salary && job.jobType && <span className="text-muted-foreground/30">•</span>}
                </div>
              )}
              {job.jobType && job.jobType !== 'No Job Type Info' && (
                <div className="flex items-center gap-1">
                  <RiTimeLine className="size-3" />
                  {job.jobType}
                </div>
              )}
              <div className="flex-1" />
              {job.benefits && job.benefits.slice(0, 3).map((b, i) => (
                <Badge key={i} variant="secondary" className="tracking-wider">{b}</Badge>
              ))}
            </CardFooter>
          </Card>
        ))}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground/60 italic text-xs animate-in fade-in duration-500">
            <RiLoader2Line className="size-3 animate-spin" />
            Gathering more jobs...
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center bg-background/80 backdrop-blur-md border border-border/50 px-3 py-1.5 rounded-2xl shadow-xl z-50 transition-all hover:bg-background/95 group max-w-[90%] overflow-hidden">
          <Pagination className="w-auto">
            <PaginationContent className="flex-nowrap gap-0.5 overflow-x-auto no-scrollbar max-w-full px-2">
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(prev => Math.max(1, prev - 1));
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-20 h-7 w-7" : "cursor-pointer h-7 w-7"}
                  text=""
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink 
                      href="#" 
                      isActive={currentPage === pageNum}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                      className="cursor-pointer size-7 text-[10px] rounded-lg"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-20 h-7 w-7" : "cursor-pointer h-7 w-7"}
                  text=""
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
