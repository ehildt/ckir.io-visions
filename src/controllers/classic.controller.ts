import { MultipartFile, MultipartValue } from "@fastify/multipart";
import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { SocketIOConfigService } from "../configs/socket-io-config.service.js";
import {
  EVENT,
  IMAGES,
  NUM_CTX,
  PROMPT,
  REQUEST_ID,
  ROOM_ID,
  STREAM,
  TASK,
  X_VISION_LLM,
} from "../decorators/constants.js";
import {
  MultiPartFiles,
  MultiPartValue,
} from "../decorators/visions.decorator.js";
import { ApiVision } from "../decorators/visions.openapi.js";
import { ClassicControllerResponse } from "../dtos/classic/classic-response.dto.js";
import { VisionTask } from "../dtos/classic/get-fastify-multipart-data-req.dto.js";
import { Prompt } from "../dtos/prompt.dto.js";
import { ParsePromptPipe } from "../pipes/parse-prompt.pipe.js";
import { AnalyzeImageService } from "../services/analyze-image.service.js";
import { OllamaModelsService } from "../services/ollama-models.service.js";

@ApiTags("Images")
@Controller("vision")
export class ClassicController {
  constructor(
    private readonly analyzeImageService: AnalyzeImageService,
    private readonly ollamaModelsService: OllamaModelsService,
    private readonly socketIOConfigService: SocketIOConfigService,
  ) {}

  @Post()
  @ApiVision()
  @HttpCode(HttpStatus.ACCEPTED)
  async visionStream(
    @Query(REQUEST_ID) requestId: string,
    @Headers(X_VISION_LLM) vLLM: string,
    @Query(STREAM, new ParseBoolPipe({ optional: true })) stream: boolean,
    @MultiPartValue(TASK) task: MultipartValue<VisionTask>,
    @Query(ROOM_ID) roomId?: string,
    @MultiPartValue(PROMPT, new ParsePromptPipe()) prompt?: Array<Prompt>,
    @Query(NUM_CTX, new ParseIntPipe({ optional: true })) numCtx?: number,
    @Query(EVENT) eventQuery?: string,
    @MultiPartFiles({
      fieldName: IMAGES,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    })
    images?: Array<MultipartFile>,
  ): Promise<ClassicControllerResponse> {
    if (!vLLM) throw new BadRequestException("Missing x-vision-llm header");
    const results = await this.analyzeImageService.toFilePayloads(
      requestId,
      images ?? [],
    );

    const event = eventQuery ?? this.socketIOConfigService.config.event;

    void this.analyzeImageService.emit({
      buffers: results.map((r) => r.buffer).filter(Boolean),
      meta: results.map((r) => r.meta).filter(Boolean),
      filters: {
        vLLM,
        requestId,
        roomId,
        stream,
        numCtx,
        prompt,
        task: task?.value,
        event,
      },
    });

    return {
      realtime: {
        event,
        roomId,
        requestId,
      },
    };
  }

  @Get("models")
  async getModels() {
    return this.ollamaModelsService.getModels();
  }
}
