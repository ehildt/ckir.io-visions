import { Processor } from "@nestjs/bullmq";
import { Job } from "bullmq";

import { BULLMQ_QUEUE } from "../constants/bullmq.constants.js";
import { FastifyMultipartDataWithFiltersReq } from "../dtos/classic/get-fastify-multipart-data-req.dto.js";

import { VisionsProcessor } from "./visions.processor.js";

@Processor(BULLMQ_QUEUE.IMAGE_OCR)
export class VisionsOCRProcessor extends VisionsProcessor {
  async process(job: Job<FastifyMultipartDataWithFiltersReq>) {
    const { buffers, meta, filters } = job.data;
    this.validateInput(buffers, meta);

    const filenames = meta.map(({ name }) => name).join(",");
    const request = this.buildChatRequest(buffers, filenames, filters, "OCR");

    await this.handleChat(
      request,
      filters.stream ?? false,
      async (response) => {
        await this.emitToSocket(filters.roomId, {
          meta: meta.map((m) => ({ ...m, batchId: filters.batchId })),
          task: filters.task,
          ...response,
        });
      },
    );
  }
}
