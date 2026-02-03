'use client'

import { RiLoader2Line } from "@remixicon/react";

export function LoadingState() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-muted/20 gap-3">
      <RiLoader2Line className="size-6 animate-spin text-muted-foreground" />
      <span className="text-sm text-muted-foreground font-medium">Searching for jobs...</span>
    </div>
  );
}
