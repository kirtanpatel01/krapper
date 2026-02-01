import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { toast } from "sonner";

interface InputAreaProps {
  onScrape: (url: string) => void;
  onReset: () => void;
}

export function InputArea({ onScrape, onReset }: InputAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = "url-input";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputValue = inputRef.current?.value.trim() || "";

    if (!inputValue) {
      toast.error("Please enter a job title or query");
      return;
    }

    onScrape(inputValue);
  };

  const handleResetAction = () => {
    if (inputRef.current) inputRef.current.value = "";
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
        <Field>
          <FieldLabel htmlFor={inputId} className="text-muted-foreground/70 mb-2">Job Title or Keyword</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id={inputId}
              ref={inputRef}
              placeholder="e.g., Full Stack Developer"
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
        <div className="flex items-center justify-center gap-3">
          <Button type="submit" className="cursor-pointer inset-shadow-sm">
            Scrape
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleResetAction}
            className="cursor-pointer inset-shadow-sm inset-shadow-primary/5"
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
