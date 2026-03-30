import { MultipartFile } from "@fastify/multipart";
import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
} from "@nestjs/common";

import {
  BATCH_ID,
  NUM_CTX,
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
import { JsonRpcService } from "../services/json-rpc.service.js";

@Controller("mcp")
export class JsonRpcController {
  constructor(private readonly jsonRpcService: JsonRpcService) {}

  @Post()
  @ApiMcpJsonRpc()
  @HttpCode(HttpStatus.ACCEPTED)
  async rpc(
    @Query(BATCH_ID) batchId: string,
    @Query(STREAM, new ParseBoolPipe({ optional: true })) stream: boolean,
    @Headers(X_VISION_LLM) vLLM: string,
    @MultiPartPayload() req: McpGenericType<McpVisionPayloadReq_Params>,
    @Query(ROOM_ID) roomId?: string,
    @Query(NUM_CTX, new ParseIntPipe({ optional: true })) numCtx?: number,
    @MultiPartImages() images?: Array<MultipartFile>,
  ) {
    if (req.method === "tools/list")
      return this.jsonRpcService.getRequestedTools(req);

    if (!vLLM) throw new BadRequestException("Missing x-vision-llm header");
    if (!images?.length) throw new BadRequestException("Missing images");

    const results = await this.jsonRpcService.toFilePayloads(batchId, images);

    if (req.params.name === "visions.analyze") {
      return this.jsonRpcService.analyze({
        buffers: results.map((r) => r.buffer).filter(Boolean),
        meta: results.map((r) => r.meta).filter(Boolean),
        filters: {
          vLLM,
          batchId,
          roomId,
          stream,
          numCtx,
          prompt: req.params.arguments.prompt,
          task: req.params.arguments.task,
        },
      });
    }
  }
}
