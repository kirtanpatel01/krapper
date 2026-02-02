'use client'

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { RiAddLine, RiSubtractLine } from "@remixicon/react";

interface PageCounterProps {
  pageCount: number;
  setPageCount: (n: number | ((prev: number) => number)) => void;
}

export function PageCounter({ 
  pageCount, 
  setPageCount 
}: PageCounterProps) {
  const incrementPage = () => setPageCount(prev => Math.min(50, prev + 1));
  const decrementPage = () => setPageCount(prev => Math.max(1, prev - 1));

  return (
    <Field className="w-full animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
      <FieldLabel htmlFor="page-count" className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5 flex justify-between">
        Number of Pages
        <span className="font-mono">{pageCount * 15} jobs target</span>
      </FieldLabel>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="size-8"
            onClick={decrementPage}
          >
            <RiSubtractLine className="size-4" />
          </Button>
        </InputGroupAddon>
        <Input
          id="page-count"
          type="number"
          min={1}
          max={50}
          value={pageCount}
          onChange={(e) => setPageCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
          className="bg-background text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <InputGroupAddon align="inline-end">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="size-8"
            onClick={incrementPage}
          >
            <RiAddLine className="size-4" />
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
