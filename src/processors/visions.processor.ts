import { BullMQLoggerService } from "@ehildt/nestjs-bullmq-logger";
import { OllamaService } from "@ehildt/nestjs-ollama";
import { SocketIOService } from "@ehildt/nestjs-socket.io";
import { OnWorkerEvent, WorkerHost } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Job } from "bullmq";
import { ChatResponse, Message } from "ollama";

import { OllamaConfigService } from "../configs/ollama-config.service.js";
import { SocketIOConfigService } from "../configs/socket-io-config.service.js";
import { FastifyMultipartDataWithFiltersReq } from "../dtos/classic/get-fastify-multipart-data-req.dto.js";

export type SystemPromptKey = "DESCRIBE" | "COMPARE" | "OCR";

@Injectable()
export abstract class VisionsProcessor extends WorkerHost {
  constructor(
    protected readonly io: SocketIOService,
    protected readonly ollamaService: OllamaService,
    protected readonly ollamaConfigService: OllamaConfigService,
    protected readonly socketIOConfigService: SocketIOConfigService,
    protected readonly bullMQLogger: BullMQLoggerService,
  ) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async process(_job: Job<FastifyMultipartDataWithFiltersReq>) {
    throw new Error("Not implemented - override in subclass");
  }

  protected validateInput(buffers: unknown, meta: unknown): void {
    if (!Array.isArray(meta) || !meta.length) throw new Error("Missing meta");
    if (!Array.isArray(buffers) || !buffers.length)
      throw new Error("Missing buffers");
    if (buffers.length !== meta.length)
      throw new Error("buffers/meta length mismatch");
  }

  protected async handleChat(
    request: Parameters<typeof this.ollamaService.chat>[0],
    stream: boolean,
    onChunk: (response: ChatResponse) => Promise<void>,
  ): Promise<void> {
    if (stream) {
      await this.ollamaService.chat(request, onChunk);
    } else {
      const reply = await this.ollamaService.chat(request);
      const message = reply?.message;
      if (message) await onChunk({ message } as ChatResponse);
    }
  }

  protected buildChatRequest(
    buffers: Buffer[],
    filenames: string,
    filters: FastifyMultipartDataWithFiltersReq["filters"],
    systemPromptKey: SystemPromptKey,
    userMessagePrefix: string = "Image(s):",
  ) {
    const systemPrompt: Message = {
      role: "system",
      content: this.ollamaConfigService.config.systemPrompts[systemPromptKey],
    };

    const userMessage: Message = {
      role: "user",
      images: buffers,
      content: `${userMessagePrefix} ${filenames}`,
    };

    const prompts = filters.prompt ?? [];
    const messages: Message[] = [
      systemPrompt,
      ...prompts.filter(Boolean),
      userMessage,
    ];

    return {
      messages,
      options: { num_ctx: filters.numCtx },
      stream: filters.stream,
      model: filters.vLLM!,
      keep_alive: this.ollamaConfigService.config.keepAlive,
    };
  }

  protected async emitToSocket(
    roomId: string | undefined,
    data: unknown,
  ): Promise<void> {
    const event = this.socketIOConfigService.config.event;
    try {
      if (roomId) this.io.emitTo(event, roomId, data);
      else this.io.emit(event, data);
    } catch (err) {
      console.error(
        `Socket emit failed: roomId=${roomId}, data=${JSON.stringify(
          data,
        ).slice(0, 100)}`,
        err,
      );
    }
  }

  @OnWorkerEvent("completed")
  protected async onCompleted(job: Job) {
    await this.bullMQLogger.log(job);
  }

  @OnWorkerEvent("error")
  protected async onError(job: Job) {
    await this.bullMQLogger.log(job);
  }

  @OnWorkerEvent("active")
  protected async onActive(job: Job) {
    await this.bullMQLogger.log(job);
  }

  @OnWorkerEvent("failed")
  protected async onFailed(job: Job) {
    await this.bullMQLogger.error(job);
  }
}
