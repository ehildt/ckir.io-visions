import { Type } from "@nestjs/common";

import { SupportedToolFunction } from "../dtos/json-rpc/mcp.model.js";
import { McpVisionPayloadReq } from "../dtos/json-rpc/mcp-vision-payload-req.dto.js";
import { JsonRpcValidationPipe } from "../pipes/json-rpc-validation.pipe.js";

import { IMAGES } from "./constants.js";
import { MultiPartFiles, MultiPartValue } from "./visions.decorator.js";

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

export const MCP_SYNC_METHODS = ["tools/list", "initialize"];
