import { MultipartFile, MultipartValue } from "@fastify/multipart";
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
import { ApiTags } from "@nestjs/swagger";

import {
  BATCH_ID,
  IMAGES,
  NUM_CTX,
  PROMPT,
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
import { VisionTask } from "../dtos/classic/get-fastify-multipart-data-req.dto.js";
import { Prompt } from "../dtos/prompt.dto.js";
import { ParsePromptPipe } from "../pipes/parse-prompt.pipe.js";
import { AnalyzeImageService } from "../services/analyze-image.service.js";

@ApiTags("Images")
@Controller("vision")
export class ClassicController {
  constructor(private readonly visionsService: AnalyzeImageService) {}

  @Post()
  @ApiVision()
  @HttpCode(HttpStatus.ACCEPTED)
  async visionStream(
    @Query(BATCH_ID) batchId: string,
    @Headers(X_VISION_LLM) vLLM: string,
    @Query(STREAM, new ParseBoolPipe({ optional: true })) stream: boolean,
    @MultiPartValue(TASK) task: MultipartValue<VisionTask>,
    @Query(ROOM_ID) roomId?: string,
    @MultiPartValue(PROMPT, new ParsePromptPipe()) prompt?: Array<Prompt>,
    @Query(NUM_CTX, new ParseIntPipe({ optional: true })) numCtx?: number,
    @MultiPartFiles({
      fieldName: IMAGES,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    })
    images?: Array<MultipartFile>,
  ) {
    if (!vLLM) throw new BadRequestException("Missing x-vision-llm header");
    const results = await this.visionsService.toFilePayloads(
      batchId,
      images ?? [],
    );

    void this.visionsService.emit({
      buffers: results.map((r) => r.buffer).filter(Boolean),
      meta: results.map((r) => r.meta).filter(Boolean),
      filters: {
        vLLM,
        batchId,
        roomId,
        stream,
        numCtx,
        prompt,
        task: task?.value,
      },
    });
  }
}
