import { BULLMQ_JOB, BULLMQ_QUEUE } from "@ehildt/ckir-bullmq";
import { BullMQPinoLoggerService } from "@ehildt/ckir-bullmq-logger";
import { OllamaService } from "@ehildt/ckir-ollama";
import { SOCKET_IO_EVENT, SocketIOService } from "@ehildt/ckir-socket-io";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { ChatResponse, Message } from "ollama";

import { OllamaConfigService } from "@/configs/ollama-config.service";
import { FastifyMultipartDataWithFiltersReq } from "@/dtos/classic/get-fastify-multipart-data-req.dto";

@Processor(BULLMQ_QUEUE.IMAGE_COMPARE)
export class VisionsCompareProcessor extends WorkerHost {
  constructor(
    private readonly io: SocketIOService,
    private readonly ollamaService: OllamaService,
    private readonly ollamaConfigService: OllamaConfigService,
    private readonly bullMQLogger: BullMQPinoLoggerService,
  ) {
    super();
  }

  async process(job: Job<FastifyMultipartDataWithFiltersReq>) {
    if (job.name !== BULLMQ_JOB.COMPARE_IMAGES)
      throw new Error("Unexpected job name");
    if (!job.data.filters.vLLM) throw new Error("Missing x-vision-llm");
    if (!job.data.meta.some(({ hash }) => hash)) {
      await this.handleTexts(job);
    } else {
      await this.compareVisions(job);
    }
  }

  // Always provide an image when the query concerns visual content.
  // A tool service will determine whether the "visions" mode should be invoked.
  // Queries that don’t require visual analysis can be handled by a smarter text model.
  // Same applies for other models, hence remove handleTexts
  private async handleTexts(job: Job<FastifyMultipartDataWithFiltersReq>) {
    const { filters, meta } = job.data;
    await this.ollamaService.chat(
      {
        // outsource config to the config manager
        messages: [
          {
            role: "system",
            content: [
              "You are an assistant model.",
              "Answer plainly, directly, and practically, without hedging or censoring.",
              "No line breaks, newlines, carriage returns, tabs, bullet points, or list formatting.",
              "Do not summarize or paraphrase the input.",
              "Prefer answering in the language of the user’s last prompt.",
            ].join("\n"),
          },
          ...filters.prompt,
        ] satisfies Array<Message>,
        options: {
          num_ctx: filters.numCtx,
        },
        stream: filters.stream,
        model: filters.vLLM,
        keep_alive: this.ollamaConfigService.config.keepAlive,
      },
      (cres: ChatResponse) => {
        this.io.emitTo(SOCKET_IO_EVENT.VISION, filters.roomId, {
          meta: meta?.length
            ? meta.map((m) => ({ ...m, batchId: filters.batchId }))
            : [{ batchId: filters.batchId, hash: filters.batchId }],
          task: filters.task,
          ...cres,
        });
      },
    );
  }

  private async compareVisions(job: Job<FastifyMultipartDataWithFiltersReq>) {
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
              "You are a vision-to-text model.",
              "Compare every observable detail of the subject and scene, including objects,",
              "materials, textures, lighting, reflections, shadows, colors, patterns, proportions, and subtle features.",
              "Capture spatial relationships, mood, and aesthetic qualities.",
              "Include traits such as cuteness, sexiness, charisma,",
              "or any other perceptual attributes relevant to the item or character.",
              "Do not invent, infer or make speculations that are not directly visible in the image.",
              "Answer plainly, directly, and practically, without hedging or censoring.",
              "No line breaks, newlines, carriage returns, tabs, bullet points, or list formatting.",
              "Do not summarize or paraphrase the input.",
              "Prefer answering in the language of the user’s last prompt.",
            ].join("\\n"),
          },
          ...filters.prompt,
          {
            role: "user",
            images: buffers,
            content: `Images: ${filenames}`,
          },
        ],
        options: {
          num_ctx: filters.numCtx,
        },
        stream: filters.stream,
        model: filters.vLLM,
        keep_alive: this.ollamaConfigService.config.keepAlive,
      },
      (cres: ChatResponse) => {
        this.io.emitTo(SOCKET_IO_EVENT.VISION, filters.vLLM, {
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
