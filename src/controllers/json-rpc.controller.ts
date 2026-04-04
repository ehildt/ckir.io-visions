import { MultipartFile } from "@fastify/multipart";
import {
  BadRequestException,
  Controller,
  Headers,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
} from "@nestjs/common";

import { SocketIOConfigService } from "../configs/socket-io-config.service.js";
import {
  EVENT,
  NUM_CTX,
  REQUEST_ID,
  ROOM_ID,
  STREAM,
  X_VISION_LLM,
} from "../decorators/constants.js";
import {
  MultiPartImages,
  MultiPartPayload,
} from "../decorators/json-rpc.decorators.js";
import { ApiMcpJsonRpc } from "../decorators/json-rpc.openapi.decorators.js";
import { McpGenericType } from "../dtos/json-rpc/mcp.model.js";
import { McpVisionPayloadReq_Params } from "../dtos/json-rpc/mcp-vision-payload-req.dto.js";
import { MCPHttpStatusCode } from "../interceptors/mcp-status.interceptor.js";
import { JsonRpcService } from "../services/json-rpc.service.js";

@Controller("mcp")
export class JsonRpcController {
  constructor(
    private readonly jsonRpcService: JsonRpcService,
    private readonly socketIOConfigService: SocketIOConfigService,
  ) {}

  @Post()
  @ApiMcpJsonRpc()
  @MCPHttpStatusCode()
  async rpc(
    @Query(REQUEST_ID) requestId: string,
    @Query(STREAM, new ParseBoolPipe({ optional: true })) stream: boolean,
    @Headers(X_VISION_LLM) vLLM: string,
    @MultiPartPayload() req: McpGenericType<McpVisionPayloadReq_Params>,
    @Query(ROOM_ID) roomId?: string,
    @Query(NUM_CTX, new ParseIntPipe({ optional: true })) numCtx?: number,
    @Query(EVENT) eventQuery?: string,
    @MultiPartImages() images?: Array<MultipartFile>,
  ) {
    if (req.method === "initialize") return this.jsonRpcService.initialize();
    if (req.method === "tools/list")
      return this.jsonRpcService.getRequestedTools(req);

    if (!vLLM) throw new BadRequestException("Missing x-vision-llm header");
    if (!images?.length) throw new BadRequestException("Missing images");

    const event = eventQuery ?? this.socketIOConfigService.config.event;

    const results = await this.jsonRpcService.toFilePayloads(requestId, images);

    if (req.params.name === "visions.analyze")
      return this.jsonRpcService.analyze({
        buffers: results.map((r) => r.buffer).filter(Boolean),
        meta: results.map((r) => r.meta).filter(Boolean),
        filters: {
          vLLM,
          requestId,
          roomId,
          stream,
          numCtx,
          prompt: req.params.arguments.prompt,
          task: req.params.arguments.task,
          event,
        },
      });
  }
}
