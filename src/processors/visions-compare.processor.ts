import { Processor } from "@nestjs/bullmq";
import { Job } from "bullmq";

import { BULLMQ_QUEUE } from "../constants/bullmq.constants.js";
import { FastifyMultipartDataWithFiltersReq } from "../dtos/classic/get-fastify-multipart-data-req.dto.js";

import { VisionsProcessor } from "./visions.processor.js";

@Processor(BULLMQ_QUEUE.IMAGE_COMPARE)
export class VisionsCompareProcessor extends VisionsProcessor {
  async process(job: Job<FastifyMultipartDataWithFiltersReq>) {
    const { buffers, meta, filters } = job.data;
    this.validateInput(buffers, meta);

    if (!filters.vLLM) throw new Error("Missing x-vision-llm");

    const filenames = meta.map(({ name }) => name).join(",");
    const request = this.buildChatRequest(
      buffers,
      filenames,
      filters,
      "COMPARE",
      "Images:",
    );

    await this.handleVision(
      request,
      filters.stream ?? false,
      async (response) => {
        await this.emitToSocket(filters.roomId, filters.event, {
          meta: meta.map((m) => ({ ...m, requestId: filters.requestId })),
          task: filters.task,
          ...response,
        });
      },
    );
  }
}
