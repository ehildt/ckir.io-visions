import { beforeEach, describe, expect, it, vi } from "vitest";

import { OllamaConfigAdapter } from "./ollama-config.adapter";
import { OllamaConfigService } from "./ollama-config.service";

describe("OllamaConfigAdapter", () => {
  it("returns expected config from env object", () => {
    const config = OllamaConfigAdapter({
      OLLAMA_HOST: "localhost",
      OLLAMA_KEEP_ALIVE: "10m",
      OLLAMA_SYSTEM_PROMPT_DESCRIBE: "Custom describe prompt",
      OLLAMA_SYSTEM_PROMPT_COMPARE: "Custom compare prompt",
      OLLAMA_SYSTEM_PROMPT_OCR: "Custom OCR prompt",
    });

    expect(config).toEqual({
      host: "localhost",
      keepAlive: "10m",
      systemPrompts: {
        DESCRIBE: "Custom describe prompt",
        COMPARE: "Custom compare prompt",
        OCR: "Custom OCR prompt",
      },
    });
  });

  it("uses default values when env vars are not provided", () => {
    const config = OllamaConfigAdapter({});

    expect(config.host).toBe("127.0.0.1");
    expect(config.keepAlive).toBe("5m");
  });
});

describe("OllamaConfigService", () => {
  let service: OllamaConfigService;

  beforeEach(() => {
    vi.stubEnv("OLLAMA_HOST", "test-host");
    vi.stubEnv("OLLAMA_KEEP_ALIVE", "2m");
    vi.stubEnv("OLLAMA_SYSTEM_PROMPT_DESCRIBE", "Test describe");
    service = new OllamaConfigService();
  });

  it("returns config from adapter", () => {
    const config = service.config;

    expect(config.host).toBe("test-host");
    expect(config.keepAlive).toBe("2m");
    expect(config.systemPrompts.DESCRIBE).toBe("Test describe");
  });
});
