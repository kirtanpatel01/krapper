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
  Loader2, 
  ExternalLink, 
  MapPin, 
  Building2, 
  IndianRupee, 
  Clock,
  Briefcase
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Empty, 
  EmptyHeader, 
  EmptyMedia, 
  EmptyTitle, 
  EmptyDescription 
} from "@/components/ui/empty";

interface OutputAreaProps {
  jobs: ScrapedJob[];
  loading: boolean;
  query: string;
}

export function OutputArea({ jobs, loading, query }: OutputAreaProps) {
  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-muted/20 gap-3">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground font-medium">Searching Indeed...</span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Briefcase className="size-5" />
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
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="p-4 border-b flex justify-between items-center bg-muted/10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Live Results</h2>
        <Badge variant="outline" className="font-mono">{jobs.length} match(es)</Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {jobs.map((job, index) => (
          <Card key={index}>
            <CardHeader>
              <CardAction>
                <Button variant="ghost" size="icon" asChild>
                  <a href={job.jobUrl || "#"} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </CardAction>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription className="flex gap-4">
                {job.company && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="size-3.5" />
                    {job.company}
                  </span>
                )}
                {job.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
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
                  <IndianRupee className="size-3" />
                  {job.salary}
                </div>
              )}
              {job.salary && job.jobType && <span className="text-muted-foreground/30">•</span>}
              {job.jobType && job.jobType !== 'No Job Type Info' && (
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {job.jobType}
                </div>
              )}
              <div className="flex-1" />
              {job.benefits && job.benefits.slice(0, 3).map((b, i) => (
                <Badge key={i} variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">{b}</Badge>
              ))}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
