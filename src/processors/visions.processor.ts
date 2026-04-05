import { BullMQLoggerService } from "@ehildt/nestjs-bullmq-logger";
import { OllamaService } from "@ehildt/nestjs-ollama";
import { SocketIOService } from "@ehildt/nestjs-socket.io";
import { OnWorkerEvent, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Job, UnrecoverableError } from "bullmq";
import { ChatResponse, Message } from "ollama";

import { OllamaConfigService } from "../configs/ollama-config.service.js";
import { SocketIOConfigService } from "../configs/socket-io-config.service.js";
import { FastifyMultipartDataWithFiltersReq } from "../dtos/classic/get-fastify-multipart-data-req.dto.js";
import { JobTrackingService } from "../services/job-tracking.service.js";

export type SystemPromptKey = "DESCRIBE" | "COMPARE" | "OCR";

@Injectable()
export abstract class VisionsProcessor extends WorkerHost {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly io: SocketIOService,
    protected readonly ollamaService: OllamaService,
    protected readonly ollamaConfigService: OllamaConfigService,
    protected readonly socketIOConfigService: SocketIOConfigService,
    protected readonly bullMQLogger: BullMQLoggerService,
    protected readonly jobTracking: JobTrackingService,
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

  protected async handleVision(
    job: Job<FastifyMultipartDataWithFiltersReq>,
    request: Parameters<typeof this.ollamaService.chat>[0],
    stream: boolean,
    onChunk: (response: ChatResponse) => Promise<void>,
    requestId: string,
    token: string | undefined,
    roomId?: string,
    event?: string,
  ): Promise<void> {
    let cancelHandled = false;

    const wrappedOnChunk = async (response: ChatResponse) => {
      // Check cancel status at the start of each chunk
      if (this.jobTracking.isCanceled(requestId)) {
        // Only handle cancel once to prevent spam
        if (cancelHandled) {
          return;
        }
        cancelHandled = true;

        await this.emitToSocket(roomId, event, {
          requestId,
          status: "canceled",
          canceled: true,
          pending: false,
        });
        // We can't easily stop the Ollama stream, but we stop emitting
        if (token) {
          try {
            await job.moveToCompleted("canceled", token, true);
          } catch {
            // Lock may have expired for long-running jobs - this is expected
            // The UnrecoverableError below will ensure no retries happen
          }
        }
        // Throw error to stop processing and prevent retries
        // We throw after the socket emission so it completes first
        throw new UnrecoverableError("Job canceled during streaming");
      }
      await onChunk(response);
    };

    if (stream) {
      await this.ollamaService.chat(request, wrappedOnChunk);
    } else {
      // Check once at the start for non-streaming
      if (this.jobTracking.isCanceled(requestId)) {
        await this.emitToSocket(roomId, event, {
          requestId,
          status: "canceled",
          canceled: true,
          pending: false,
        });
        // Throw UnrecoverableError to prevent retries
        throw new UnrecoverableError("Job canceled");
      }
      const reply = await this.ollamaService.chat(request);

      // Check cancel again after getting response but before emitting
      if (this.jobTracking.isCanceled(requestId)) {
        await this.emitToSocket(roomId, event, {
          requestId,
          status: "canceled",
          canceled: true,
          pending: false,
        });
        // Throw UnrecoverableError to prevent retries
        throw new UnrecoverableError("Job canceled");
      }

      const message = reply?.message;
      if (message) await wrappedOnChunk({ message } as ChatResponse);
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

    const prompts = (filters.prompt ?? []).filter(
      (p): p is { role: string; content: string } =>
        p &&
        typeof p.role === "string" &&
        typeof p.content === "string" &&
        p.content.trim().length > 0,
    );
    const messages: Message[] = [systemPrompt, ...prompts, userMessage];

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
    event: string | undefined,
    data: unknown,
  ): Promise<void> {
    const socketEvent = event ?? "vision";
    try {
      const payload = { event: socketEvent, ...(data as object) };
      this.logger.log(`[emitToSocket] Emitting to room=${roomId}, event=${socketEvent}, data=${JSON.stringify(data).slice(0, 100)}`);
      if (roomId) {
        this.io.emitTo(socketEvent, roomId, payload);
        this.logger.log(`[emitToSocket] Called emitTo for room ${roomId}`);
      } else {
        this.io.emit(socketEvent, payload);
        this.logger.log(`[emitToSocket] Called emit (broadcast)`);
      }
    } catch (err) {
      this.logger.error(
        `Socket emit failed: roomId=${roomId}, data=${JSON.stringify(
          data,
        ).slice(0, 100)}`,
        err,
      );
    }
  }

  @OnWorkerEvent("completed")
  protected async onCompleted(job: Job<FastifyMultipartDataWithFiltersReq>) {
    await this.bullMQLogger.log(job);
    this.jobTracking.remove(job.name);
  }

  @OnWorkerEvent("active")
  protected async onActive(job: Job<FastifyMultipartDataWithFiltersReq>) {
    await this.bullMQLogger.log(job);
    this.jobTracking.setActive(job.name);
  }

  @OnWorkerEvent("failed")
  protected async onFailed(job: Job<FastifyMultipartDataWithFiltersReq>) {
    // Check if this is a canceled job (UnrecoverableError with "canceled" message)
    const failedReason = (job as any).failedReason || "";
    if (failedReason.includes("canceled")) {
      await this.bullMQLogger.log(job, "canceled");
    } else {
      await this.bullMQLogger.error(job);
    }
    this.jobTracking.remove(job.name);
  }
}
