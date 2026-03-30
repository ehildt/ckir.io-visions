import { Config } from "ollama";

import { SYSTEM_PROMPTS } from "../constants/prompt.constants.js";

export interface OllamaSystemPrompts {
  DESCRIBE: string;
  COMPARE: string;
  OCR: string;
}

export function OllamaConfigAdapter(
  env = process.env,
): Config & { keepAlive: string; systemPrompts: OllamaSystemPrompts } {
  return {
    host: env.OLLAMA_HOST ?? "127.0.0.1",
    keepAlive: env.OLLAMA_KEEP_ALIVE ?? "5m",
    systemPrompts: {
      DESCRIBE: env.OLLAMA_SYSTEM_PROMPT_DESCRIBE ?? SYSTEM_PROMPTS.DESCRIBE,
      COMPARE: env.OLLAMA_SYSTEM_PROMPT_COMPARE ?? SYSTEM_PROMPTS.COMPARE,
      OCR: env.OLLAMA_SYSTEM_PROMPT_OCR ?? SYSTEM_PROMPTS.OCR,
    },
  };
}
