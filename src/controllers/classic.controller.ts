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

import { MultiPartFiles, MultiPartValue } from "@/decorators/visions.decorator";
import { ApiVision } from "@/decorators/visions.openapi";
import { VisionTask } from "@/dtos/classic/get-fastify-multipart-data-req.dto";
import { Prompt } from "@/dtos/prompt.dto";
import { ParsePromptPipe } from "@/pipes/parse-prompt.pipe";
import { AnalyzeImageService } from "@/services/analyze-image.service";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];

@ApiTags("Images")
@Controller("vision")
export class ClassicController {
  constructor(private readonly visionsService: AnalyzeImageService) {}

  @Post()
  @ApiVision()
  @HttpCode(HttpStatus.ACCEPTED)
  async visionStream(
    @Query("batchId") batchId: string,
    @Headers("x-vision-llm") vLLM: string,
    @Query("stream", new ParseBoolPipe({ optional: true })) stream: boolean,
    @MultiPartValue("task") task: MultipartValue<VisionTask>,
    @Query("roomId") roomId?: string,
    @MultiPartValue("prompt", new ParsePromptPipe()) prompt?: Array<Prompt>,
    @Query("numCtx", new ParseIntPipe({ optional: true })) numCtx?: number,
    @MultiPartFiles({
      fieldName: "images",
      allowedMimeTypes: ALLOWED_MIME_TYPES,
    })
    images?: Array<MultipartFile>,
  ) {
    if (!vLLM) throw new BadRequestException("Missing x-vision-llm header");
    const results = await this.visionsService.toFilePayloads(batchId, images);

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
