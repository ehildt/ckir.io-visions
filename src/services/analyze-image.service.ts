import { BULLMQ_JOB, BULLMQ_QUEUE } from "@ehildt/ckir-bullmq";
import { hashPayload } from "@ehildt/ckir-helpers";
import { MultipartFile } from "@fastify/multipart";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

import {
  FastifyMultipartDataWithFiltersReq,
  FastifyMultipartMeta,
} from "@/dtos/classic/get-fastify-multipart-data-req.dto";

@Injectable()
export class AnalyzeImageService {
  constructor(
    @InjectQueue(BULLMQ_QUEUE.IMAGE_DESCRIBE)
    private readonly describeQueue: Queue,
    @InjectQueue(BULLMQ_QUEUE.IMAGE_COMPARE)
    private readonly compareQueue: Queue,
    @InjectQueue(BULLMQ_QUEUE.IMAGE_OCR)
    private readonly ocrQueue: Queue,
  ) {}

  async toFilePayloads(batchId: string, images: Array<MultipartFile>) {
    return await Promise.all(
      images.map(async (file) => {
        const buffer = await file.toBuffer();
        const meta: FastifyMultipartMeta = {
          name: file.filename,
          type: file.mimetype,
          hash: `${hashPayload(buffer, "sha256")}_${batchId}`,
        };
        return { buffer, meta };
      }),
    );
  }

  async emit(req: FastifyMultipartDataWithFiltersReq) {
    if (req.filters.task === "describe")
      return this.describeQueue.add(BULLMQ_JOB.DESCRIBE_IMAGE, req);

    if (req.filters.task === "compare")
      return this.compareQueue.add(BULLMQ_JOB.COMPARE_IMAGES, req);

    if (req.filters.task === "ocr")
      return this.ocrQueue.add(BULLMQ_JOB.OCR_IMAGE, req);
  }
}
