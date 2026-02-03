'use client'

import { RiBriefcaseLine } from "@remixicon/react";
import { 
  Empty, 
  EmptyHeader, 
  EmptyMedia, 
  EmptyTitle, 
  EmptyDescription 
} from "@/components/ui/empty";

interface EmptyStateProps {
  query: string;
}

export function EmptyState({ query }: EmptyStateProps) {
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
              : "Enter a job title or keyword on the left to start searching for jobs."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
