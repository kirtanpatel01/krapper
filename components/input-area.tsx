"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

interface InputAreaProps {
  onScrape: (url: string) => void;
  onReset: () => void;
}

export function InputArea({ onScrape, onReset }: InputAreaProps) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = "url-input";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputValue = inputRef.current?.value.trim() || "";

    if (!inputValue) {
      setError("Please enter a URL");
      return;
    }

    const domainPart = inputValue.replace(/^https?:\/\//, "");

    if (domainPart.includes(" ") || !domainPart.includes(".")) {
      setError("Please enter a valid domain (e.g., example.com)");
      return;
    }

    try {
      const finalUrl = `https://${domainPart}`;
      new URL(finalUrl);
      onScrape(finalUrl);
      setError(null);
    } catch (err) {
      setError("Invalid URL format");
    }
  };

  const handleResetAction = () => {
    if (inputRef.current) inputRef.current.value = "";
    setError(null);
    onReset();
    inputRef.current?.focus();
  };

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
      <form onSubmit={handleSubmit} className="grid w-full max-w-sm gap-4">
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor={inputId}>Website URL</FieldLabel>
          <InputGroup data-invalid={!!error} aria-invalid={!!error}>
            <InputGroupAddon>
              <InputGroupText>
                <span>https://</span>
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id={inputId}
              ref={inputRef}
              placeholder="example.com"
              className="pl-0.5!"
              onInput={() => error && setError(null)}
            />
            <InputGroupAddon align="inline-end">
              <KbdGroup>
                <Kbd>Ctrl</Kbd>
                <span>+</span>
                <Kbd>/</Kbd>
              </KbdGroup>
            </InputGroupAddon>
          </InputGroup>
          <FieldError className="animate-in fade-in slide-in-from-top-1">
            {error}
          </FieldError>
        </Field>
        <div className="flex items-center justify-center gap-3">
          <Button type="submit" className="cursor-pointer">
            Scrape
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleResetAction}
            className="cursor-pointer"
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
