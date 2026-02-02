'use client'

import { RiKey2Line, RiEyeLine, RiEyeOffLine, RiShieldUserLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface ApiKeyFieldProps {
  apiKey: string;
  setApiKey: (v: string) => void;
  showApiKey: boolean;
  setShowApiKey: (v: boolean) => void;
  hasCustomKey: boolean;
  usage: { count: number; limit: number };
}

export function ApiKeyField({ 
  apiKey, 
  setApiKey, 
  showApiKey, 
  setShowApiKey, 
  hasCustomKey, 
  usage 
}: ApiKeyFieldProps) {
  return (
    <Field>
      <div className="flex items-center justify-between mb-2">
        <FieldLabel htmlFor="api-key" className="text-muted-foreground/70 font-medium">
          Custom Scrape.do API Key
        </FieldLabel>
        {hasCustomKey ? (
          <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20 animate-in fade-in zoom-in-95 duration-300">
            UNLOCKED
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] text-muted-foreground/50 italic">
            FREE: {Math.max(0, usage.limit - usage.count)} left
          </Badge>
        )}
      </div>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <RiKey2Line className={`size-4 transition-colors ${hasCustomKey ? 'text-green-500' : 'text-muted-foreground/50'}`} />
        </InputGroupAddon>
        <InputGroupInput
          id="api-key"
          type={showApiKey ? "text" : "password"}
          placeholder="Paste Scrape.do Token"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="px-4!"
        />
        <InputGroupAddon align="inline-end">
          <button 
            type="button" 
            onClick={() => setShowApiKey(!showApiKey)}
            className="p-1 hover:text-foreground transition-colors"
          >
            {showApiKey ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
          </button>
        </InputGroupAddon>
      </InputGroup>

      <div className="mt-2 flex items-start gap-2 text-[10px] text-muted-foreground/50 leading-relaxed bg-primary/5 p-2 rounded-lg border border-primary/10">
        <RiShieldUserLine className="size-3 mt-0.5 shrink-0 text-primary/40" />
        <p>
          Your API key is processed <span className="text-primary/60 font-medium">locally</span> for the current session. 
          We do not store, log, or share your credentials with third parties.
        </p>
      </div>
    </Field>
  );
}
