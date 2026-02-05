import { Config } from "ollama";

export function OllamaConfigAdapter(
  env = process.env,
): Config & { keepAlive: string } {
  return {
    host: env.OLLAMA_HOST ?? "127.0.0.1",
    keepAlive: env.OLLAMA_KEEP_ALIVE ?? "5m",
  };
}
