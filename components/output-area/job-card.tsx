'use client'

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
  RiExternalLinkLine, 
  RiMapPin2Line, 
  RiBuilding2Line, 
  RiTimeLine
} from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface JobCardProps {
  job: ScrapedJob;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Card>
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
  );
}
