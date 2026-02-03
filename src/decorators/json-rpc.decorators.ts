import { Type } from "@nestjs/common";

import { IMAGES } from "./constants";
import { MultiPartFiles, MultiPartValue } from "./visions.decorator";

import { SupportedToolFunction } from "@/dtos/json-rpc/mcp.model";
import { McpVisionPayloadReq } from "@/dtos/json-rpc/mcp-vision-payload-req.dto";
import { JsonRpcValidationPipe } from "@/pipes/json-rpc-validation.pipe";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];

const MCP_DTO_MAP = new Map<SupportedToolFunction, Type>([
  ["visions.analyze", McpVisionPayloadReq],
]);

export const MultiPartPayload = () =>
  MultiPartValue("payload", new JsonRpcValidationPipe(MCP_DTO_MAP));

export const MultiPartImages = () =>
  MultiPartFiles({
    required: false,
    fieldName: IMAGES,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
  });
