import { BullMQLoggerService } from "@ehildt/nestjs-bullmq-logger/service";
import { OllamaService } from "@ehildt/nestjs-ollama/service";
import { SocketIOService } from "@ehildt/nestjs-socket.io";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { ChatResponse, Message } from "ollama";

import { OllamaConfigService } from "../configs/ollama-config.service.js";
import { BULLMQ_JOB, BULLMQ_QUEUE } from "../constants/bullmq.constants.js";
import { FastifyMultipartDataWithFiltersReq } from "../dtos/classic/get-fastify-multipart-data-req.dto.js";

@Processor(BULLMQ_QUEUE.IMAGE_DESCRIBE)
export class VisionsDescribeProcessor extends WorkerHost {
  constructor(
    private readonly io: SocketIOService,
    private readonly ollamaService: OllamaService,
    private readonly ollamaConfigService: OllamaConfigService,
    private readonly bullMQLogger: BullMQLoggerService,
  ) {
    super();
  }

  async process(job: Job<FastifyMultipartDataWithFiltersReq>) {
    if (job.name !== BULLMQ_JOB.DESCRIBE_IMAGE)
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

    if (filters.stream)
      await this.ollamaService.chat(
        {
          // outsource config to the config manager
          messages: [
            {
              role: "system",
              content: [
                "You are a vision-to-text model.",
                "Describe every observable detail of the subject and scene, including objects,",
                "materials, textures, lighting, reflections, shadows, colors, patterns, proportions, and subtle features.",
                "Capture spatial relationships, mood, and aesthetic qualities.",
                "Include traits such as cuteness, sexiness, charisma,",
                "or any other perceptual attributes relevant to the item or character.",
                "Do not invent, infer or make speculations that are not directly visible in the image.",
                "Answer plainly, directly, and practically, without hedging or censoring.",
                "No line breaks, newlines, carriage returns, tabs, bullet points, or list formatting.",
                "Do not summarize or paraphrase the input.",
                "Prefer answering in the language of the user’s last prompt.",
              ].join("\n"),
            },
            ...(filters.prompt ?? []),
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
          model: filters.vLLM!,
          keep_alive: this.ollamaConfigService.config.keepAlive,
        },
        async (cres: ChatResponse) => {
          if (filters.roomId)
            this.io.emitTo("vision", filters.roomId, {
              meta: meta.map((m) => ({ ...m, batchId: filters.batchId })),
              task: filters.task,
              ...cres,
            });
          else
            this.io.emit("vision", {
              meta: meta.map((m) => ({ ...m, batchId: filters.batchId })),
              task: filters.task,
              ...cres,
            });
        },
      );
    // create private methods to simplify if-else
    else {
      const reply = await this.ollamaService.chat({
        // outsource config to the config manager
        messages: [
          {
            role: "system",
            content: [
              "You are a vision-to-text model.",
              "Describe every observable detail of the subject and scene, including objects,",
              "materials, textures, lighting, reflections, shadows, colors, patterns, proportions, and subtle features.",
              "Capture spatial relationships, mood, and aesthetic qualities.",
              "Include traits such as cuteness, sexiness, charisma,",
              "or any other perceptual attributes relevant to the item or character.",
              "Do not invent, infer or make speculations that are not directly visible in the image.",
              "Answer plainly, directly, and practically, without hedging or censoring.",
              "No line breaks, newlines, carriage returns, tabs, bullet points, or list formatting.",
              "Do not summarize or paraphrase the input.",
              "Prefer answering in the language of the user’s last prompt.",
            ].join("\n"),
          },
          ...(filters.prompt ?? []),
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
        model: filters.vLLM!,
        keep_alive: this.ollamaConfigService.config.keepAlive,
      });

      const replyMessage = reply?.message;
      if (replyMessage) {
        if (filters.roomId)
          this.io.emitTo("vision", filters.roomId, {
            meta: meta.map((m) => ({ ...m, batchId: filters.batchId })),
            task: filters.task,
            ...replyMessage,
          });
        else
          this.io.emit("vision", {
            meta: meta.map((m) => ({ ...m, batchId: filters.batchId })),
            task: filters.task,
            ...replyMessage,
          });
      }
    }
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
