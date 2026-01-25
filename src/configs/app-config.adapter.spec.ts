process.env.ADDRESS = "127.0.0.1";
process.env.NODE_ENV = "development";
process.env.PORT = "3000";
process.env.BODY_LIMIT = "1024";
process.env.LOG_LEVEL = "warn";
process.env.PRINT_CONFIG = "true";
process.env.ENABLE_SWAGGER = "false";
process.env.CORS_ORIGIN = "https://example.com";
process.env.CORS_METHODS = "GET,POST";
process.env.CORS_PREFLIGHT_CONTINUE = "true";
process.env.CORS_OPTIONS_SUCCESS_STATUS = "204";
process.env.CORS_CREDENTIALS = "true";
process.env.CORS_ALLOWED_HEADERS = "Authorization";

import { AppConfigSchema } from "@ehildt/ckir-helpers";

import { AppConfigAdapter } from "./app-config.adapter";

describe("AppConfigAdapter", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns expected config from environment variables", () => {
    const config = AppConfigAdapter();
    expect(config).toEqual({
      address: "127.0.0.1",
      nodeEnv: "development",
      port: 3000,
      bodyLimit: 1024,
      logLevel: ["warn"],
      printConfig: true,
      enableSwagger: false,
      cors: {
        origin: "https://example.com",
        methods: "GET,POST",
        preflightContinue: true,
        optionsSuccessStatus: 204,
        credentials: true,
        allowedHeaders: "Content-Type,Accept,X-Vision-LLM",
      },
    });
  });
});

describe("AppConfigSchema", () => {
  it("validates correct config", () => {
    const result = AppConfigSchema.validate({
      printConfig: true,
      enableSwagger: false,
      bodyLimit: 1024,
      address: "127.0.0.1",
      port: 3000,
      nodeEnv: "development",
      cors: {
        origin: "https://example.com",
        methods: "GET,POST",
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
        allowedHeaders: "Authorization",
      },
    });

    expect(result.error).toBeUndefined();
  });

  it("fails if required fields are missing", () => {
    const result = AppConfigSchema.validate({});
    expect(result.error).toBeDefined();
    expect(
      result.error?.details.some((d) => d.message.includes("printConfig")),
    ).toBe(true);
  });
});
