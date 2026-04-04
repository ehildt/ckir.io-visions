import { applyDecorators } from "@nestjs/common";
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from "@nestjs/swagger";

import {
  McpInitializeResponse,
  McpToolsCallResponse,
  McpToolsListResponse,
} from "../dtos/json-rpc/mcp-response.dto.js";
import {
  McpToolsListReq,
  McpToolsListReq_Params,
} from "../dtos/json-rpc/mcp-tools-list-req.dto.js";
import {
  McpVisionPayloadReq,
  McpVisionPayloadReq_Params,
} from "../dtos/json-rpc/mcp-vision-payload-req.dto.js";

import { X_VISION_LLM } from "./constants.js";
import {
  ApiQueryEvent,
  ApiQueryNumCtx,
  ApiQueryRequestId,
  ApiQueryRoomId,
  ApiQueryStream,
} from "./visions.openapi.js";

const ApiJsonRpcBodySchema = () =>
  ApiBody({
    schema: {
      type: "object",
      properties: {
        payload: {
          type: "object",
          description: [
            "**JSON-RPC payload**",
            "",
            "A JSON-RPC 2.0 request envelope describing the operation to execute.",
            "",
            '- jsonrpc MUST be "2.0".',
            "- method determines the operation (e.g. tools/list, tools/call).",
            "- When method is tools/call, the payload MUST conform to the selected tool schema.",
            "",
            "This field MUST be provided as a multipart form-data field named payload.",
          ].join("\n"),
          oneOf: [
            { $ref: getSchemaPath(McpToolsListReq) },
            { $ref: getSchemaPath(McpVisionPayloadReq) },
          ],
        },

        images: {
          type: "array",
          description: [
            "**Image inputs (optional)**",
            "",
            "One or more image files supplied as input to vision-enabled tools.",
            "",
            "- REQUIRED when invoking vision tools that operate on images.",
            "- MUST be omitted for non-vision operations (e.g. tools/list).",
            "- Each image MUST be sent as multipart form-data.",
            "",
            "Supported formats: PNG, JPEG, WEBP.",
          ].join("\n"),
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
      required: ["payload"],
    },
  });

export function ApiMcpJsonRpc() {
  return applyDecorators(
    ApiQueryNumCtx(),
    ApiQueryStream(),
    ApiQueryRequestId(),
    ApiQueryEvent(),
    ApiQueryRoomId(),
    ApiConsumes("multipart/form-data"),
    ApiExtraModels(
      McpVisionPayloadReq,
      McpToolsListReq,
      McpToolsListReq_Params,
      McpVisionPayloadReq_Params,
      McpInitializeResponse,
      McpToolsListResponse,
      McpToolsCallResponse,
    ),
    ApiJsonRpcBodySchema(),
    ApiOkResponse({
      description: "MCP initialize or tools/list response",
      schema: {
        oneOf: [
          { $ref: getSchemaPath(McpInitializeResponse) },
          { $ref: getSchemaPath(McpToolsListResponse) },
        ],
      },
    }),
    ApiAcceptedResponse({
      description: "MCP tools/call response (async processing)",
      schema: {
        $ref: getSchemaPath(McpToolsCallResponse),
      },
    }),
    ApiOperation({
      description: `
      Processes an MCP request and returns the corresponding MCP response. 
      Use this endpoint to invoke MCP tools/capabilities exposed by the server. 
      The request body must conform to the MCP message schema; 
      responses follow the same protocol envelope.`,
    }),
    ApiHeader({
      name: X_VISION_LLM,
      description: "Specifies which LLM to use for vision",
      required: true,
      schema: {
        type: "string",
        example: "ministral-3:14b",
      },
    }),
  );
}
