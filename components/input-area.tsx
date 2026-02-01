'use client'

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import { Badge } from "./ui/badge";

interface InputAreaProps {
  onScrape: (query: string, maxPages: number) => void;
  onReset: () => void;
}

export function InputArea({ onScrape, onReset }: InputAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDeepScrape, setIsDeepScrape] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const inputId = "url-input";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = inputRef.current?.value.trim() || "";

    if (!query) {
      toast.error("Please enter a job title or keyword");
      return;
    }

    onScrape(query, isDeepScrape ? pageCount : 1);
  };

  const handleResetAction = () => {
    if (inputRef.current) inputRef.current.value = "";
    setIsDeepScrape(false);
    setPageCount(1);
    onReset();
    inputRef.current?.focus();
  };

  const incrementPage = () => setPageCount(prev => Math.min(50, prev + 1));
  const decrementPage = () => setPageCount(prev => Math.max(1, prev - 1));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex-1 flex justify-center items-center">
      <form onSubmit={handleSubmit} className="grid w-full max-w-sm gap-6 p-6">
        <Field>
          <FieldLabel htmlFor={inputId} className="text-muted-foreground/70 mb-2 font-medium">Job Title or Keyword</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id={inputId}
              ref={inputRef}
              placeholder="e.g., Frontend Developer"
              className="px-4!"
            />
            <InputGroupAddon align="inline-end">
              <KbdGroup>
                <Kbd>Ctrl</Kbd>
                <span>+</span>
                <Kbd>/</Kbd>
              </KbdGroup>
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsDeepScrape(!isDeepScrape)}>
              <input
                type="checkbox"
                id="deep-scrape"
                checked={isDeepScrape}
                onChange={(e) => setIsDeepScrape(e.target.checked)}
                className="size-4 accent-primary rounded cursor-pointer"
              />
              <label htmlFor="deep-scrape" className="text-sm font-medium cursor-pointer select-none">
                Deep Scrape (Pagination)
              </label>
            </div>
            {isDeepScrape && (
              <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary tracking-wider">1 credit/page</Badge>
            )}
          </div>

          {isDeepScrape && (
            <Field className="animate-in fade-in slide-in-from-top-2 duration-300">
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
                    <Minus className="size-3.5" />
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
                    <Plus className="size-3.5" />
                  </Button>
                </InputGroupAddon>
              </InputGroup>
              <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed italic">
                Fetches ~15 jobs per page. Early exit enabled if no new jobs found.
              </p>
            </Field>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button type="submit" className="flex-1 cursor-pointer inset-shadow-sm h-11">
            Scrape
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleResetAction}
            className="cursor-pointer inset-shadow-sm inset-shadow-primary/5 h-11"
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
