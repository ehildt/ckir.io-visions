import { BULLMQ_JOB, BULLMQ_QUEUE } from "@ehildt/ckir-bullmq";
import { BullMQPinoLoggerService } from "@ehildt/ckir-bullmq-logger";
import { OllamaService } from "@ehildt/ckir-ollama";
import { SOCKET_IO_EVENT, SocketIOService } from "@ehildt/ckir-socket-io";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { ChatResponse, Message } from "ollama";

import { OllamaConfigService } from "@/configs/ollama-config.service";
import { FastifyMultipartDataWithFiltersReq } from "@/dtos/classic/get-fastify-multipart-data-req.dto";

@Processor(BULLMQ_QUEUE.IMAGE_OCR)
export class VisionsOCRProcessor extends WorkerHost {
  constructor(
    private readonly io: SocketIOService,
    private readonly ollamaService: OllamaService,
    private readonly ollamaConfigService: OllamaConfigService,
    private readonly bullMQLogger: BullMQPinoLoggerService,
  ) {
    super();
  }

  async process(job: Job<FastifyMultipartDataWithFiltersReq>) {
    if (job.name !== BULLMQ_JOB.OCR_IMAGE)
      throw new Error("Unexpected job name");
    await this.handleVisions(job);
  }

  private async handleVisions(job: Job<FastifyMultipartDataWithFiltersReq>) {
    const { buffers, meta, filters } = job.data;

    if (!Array.isArray(job.data.meta) || !job.data.meta.length)
      throw new Error("Missing meta");
    if (!Array.isArray(buffers) || !buffers.length)
      throw new Error("Missing buffers");
    if (buffers.length !== meta.length)
      throw new Error("buffers/meta length mismatch");

    const filenames = meta.map(({ name }) => name).join(",");
    await this.ollamaService.chat(
      {
        // outsource config to the config manager
        messages: [
          {
            role: "system",
            content: [
              "You are an OCR engine.",
              "Extract all visible text exactly as written,",
              "preserving case, punctuation, emojis and spacing.",
              "Do not describe the image or add commentary.",
              "Output plain text only.",
            ].join("\n"),
          },
          ...filters.prompt,
          {
            role: "user",
            images: buffers,
            content: `Image(s): ${filenames}`,
          },
        ] satisfies Array<Message>,
        options: {
          num_ctx: filters.numCtx,
        },
        stream: filters.stream,
        model: filters.vLLM,
        keep_alive: this.ollamaConfigService.config.keepAlive,
      },
      async (cres: ChatResponse) => {
        this.io.emitTo(SOCKET_IO_EVENT.VISION, filters.roomId, {
          meta: meta.map((m) => ({ ...m, batchId: filters.batchId })),
          task: filters.task,
          ...cres,
        });
      },
    );
  }

  @OnWorkerEvent("completed")
  async onCompleted(job: Job) {
    await this.bullMQLogger.log(job);
  }

  @OnWorkerEvent("error")
  async onError(job: Job) {
    await this.bullMQLogger.log(job);
  }

  @OnWorkerEvent("active")
  async onActive(job: Job) {
    await this.bullMQLogger.log(job);
  }

  @OnWorkerEvent("failed")
  async onFailed(job: Job) {
    await this.bullMQLogger.error(job);
  }
}
