'use client'

import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface QueryFieldProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  isUsageLimitReached: boolean;
}

export function QueryField({ 
  inputRef, 
  isUsageLimitReached 
}: QueryFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor="job-input" className="text-muted-foreground/70 mb-2 font-medium">
        Job Title or Keyword
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id="job-input"
          ref={inputRef}
          disabled={isUsageLimitReached}
          placeholder={isUsageLimitReached ? "Limit Reached 🛑" : "e.g., Frontend Developer"}
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
  );
}
