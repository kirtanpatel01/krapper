"use client";

interface OutputAreaProps {
  url: string | null;
}

export function OutputArea({ url }: OutputAreaProps) {
  return (
    <div className="flex-1 flex justify-center items-center">
      <span className="text-muted-foreground">
        {url ? url : "Result will appear here"}
      </span>
    </div>
  );
}
