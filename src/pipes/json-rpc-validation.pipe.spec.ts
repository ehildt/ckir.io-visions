import { JsonRpcValidationPipe } from "./json-rpc-validation.pipe";

import { McpVisionPayloadReq } from "@/dtos/json-rpc/mcp-vision-payload-req.dto";

describe("JsonRpcValidationPipe with McpVisionPayloadReq", () => {
  let pipe: JsonRpcValidationPipe<string>;

  beforeEach(() => {
    const funcDtoMap = new Map<string, any>([
      ["visions.analyze", McpVisionPayloadReq],
    ]);
    pipe = new JsonRpcValidationPipe(funcDtoMap);
  });

  const validBasePayload = {
    id: 1,
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      function: "visions.analyze",
      arguments: {},
    },
  };

  it("should pass valid payload", async () => {
    const result = await pipe.transform(validBasePayload);
    expect(result).toBeInstanceOf(McpVisionPayloadReq);
    expect(result.id).toBe(1);
    expect(result.params.function).toBe("visions.analyze");
  });

  it("should throw if jsonrpc version is invalid", async () => {
    const payload = { ...validBasePayload, jsonrpc: "1.0" };
    await expect(pipe.transform(payload)).rejects.toThrow(
      "Invalid jsonrpc version",
    );
  });

  it("should throw if method is missing", async () => {
    const { method, ...payload } = validBasePayload;
    await expect(pipe.transform(payload)).rejects.toThrow(
      "Missing method field",
    );
  });

  it("should throw if method is unsupported", async () => {
    const payload = { ...validBasePayload, method: "tools/unknown" };
    await expect(pipe.transform(payload)).rejects.toThrow(
      "Unsupported method: tools/unknown",
    );
  });

  it("should throw if function is unsupported", async () => {
    const payload = {
      ...validBasePayload,
      params: { function: "unknown", arguments: {} },
    };
    await expect(pipe.transform(payload)).rejects.toThrow(
      "Unsupported function: unknown",
    );
  });

  it("should validate nested arguments", async () => {
    const payload = {
      ...validBasePayload,
      params: {
        function: "visions.analyze",
        arguments: { task: 123 }, // invalid, should be string
      },
    };
    await expect(pipe.transform(payload)).rejects.toThrow(/Validation failed/);
  });

  it("should pass when nested arguments are valid", async () => {
    const payload = {
      ...validBasePayload,
      params: {
        function: "visions.analyze",
        arguments: { task: "describe" },
      },
    };
    const result = await pipe.transform(payload);
    expect(result.params.arguments.task).toBe("describe");
  });

  it("should unwrap stringified JSON", async () => {
    const payloadStr = JSON.stringify(validBasePayload);
    const result = await pipe.transform(payloadStr);
    expect(result).toBeInstanceOf(McpVisionPayloadReq);
  });

  it("should unwrap multipart field", async () => {
    const payload = { type: "field", value: JSON.stringify(validBasePayload) };
    const result = await pipe.transform(payload);
    expect(result).toBeInstanceOf(McpVisionPayloadReq);
  });

  it("should unwrap fields.payload.value", async () => {
    const payload = {
      fields: { payload: { value: JSON.stringify(validBasePayload) } },
    };
    const result = await pipe.transform(payload);
    expect(result).toBeInstanceOf(McpVisionPayloadReq);
  });
});
