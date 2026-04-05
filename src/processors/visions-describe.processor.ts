import { Processor } from "@nestjs/bullmq";
import { Job, UnrecoverableError } from "bullmq";

import { BULLMQ_QUEUE } from "../constants/bullmq.constants.js";
import { FastifyMultipartDataWithFiltersReq } from "../dtos/classic/get-fastify-multipart-data-req.dto.js";

import { VisionsProcessor } from "./visions.processor.js";

@Processor(BULLMQ_QUEUE.IMAGE_DESCRIBE)
export class VisionsDescribeProcessor extends VisionsProcessor {
  async process(job: Job<FastifyMultipartDataWithFiltersReq>) {
    const requestId = job.name;

    // Early cancel check - exit immediately if job was canceled while in queue
    if (this.jobTracking.isCanceled(requestId)) {
      await this.emitToSocket(job.data.filters.roomId, job.data.filters.event, {
        requestId,
        status: "canceled",
        canceled: true,
        pending: false,
      });
      throw new UnrecoverableError("Job canceled before processing");
    }

    const { buffers, meta, filters } = job.data;
    this.validateInput(buffers, meta);

    const filenames = meta.map(({ name }) => name).join(",");
    const request = this.buildChatRequest(
      buffers,
      filenames,
      filters,
      "DESCRIBE",
    );

    await this.handleVision(
      job,
      request,
      filters.stream ?? false,
      async (response) => {
        await this.emitToSocket(filters.roomId, filters.event, {
          roomId: filters.roomId,
          meta: meta.map((m) => ({ ...m, requestId: requestId })),
          task: filters.task,
          ...response,
        });
      },
      requestId,
      filters.roomId,
      filters.event,
    );
  }
}
