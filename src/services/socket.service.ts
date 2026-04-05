import { SocketIOService } from "@ehildt/nestjs-socket.io";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { AnalyzeImageService } from "./analyze-image.service.js";

@Injectable()
export class SocketService implements OnModuleInit {
  private readonly logger = new Logger(SocketService.name);

  constructor(
    private readonly io: SocketIOService,
    private readonly analyzeImageService: AnalyzeImageService,
  ) {}

  onModuleInit() {
    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers(): void {
    const socketIO = this.io.io;
    if (!socketIO) {
      this.logger.warn("Socket.IO instance not available");
      return;
    }

    socketIO.on("connection", (socket) => {
      this.logger.log(`Client connected: ${socket.id}`);

      socket.on("join", async (roomId: string) => {
        await socket.join(roomId);
        this.logger.log(`Socket ${socket.id} joined room: ${roomId}`);
        this.logger.log(`[join] Room ${roomId} now has ${socketIO.sockets.adapter.rooms.get(roomId)?.size || 0} clients`);
      });

      socket.on("leave", async (roomId: string) => {
        await socket.leave(roomId);
        this.logger.log(`Socket ${socket.id} left room: ${roomId}`);
      });

      socket.on("cancel", async (requestId: string) => {
        this.logger.log(
          `Socket ${socket.id} requested cancel for: ${requestId}`,
        );
        const result = await this.analyzeImageService.cancel(requestId);
        socket.emit("cancel_result", {
          requestId,
          success: result,
        });
      });

      socket.on("disconnect", (reason) => {
        this.logger.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
      });
    });
  }

  async emitToRoom(
    roomId: string,
    event: string,
    data: unknown,
  ): Promise<void> {
    const socketIO = this.io.io;
    if (!socketIO) {
      this.logger.warn("Socket.IO instance not available for emit");
      return;
    }
    this.logger.log(`[emitToRoom] Emitting event=${event} to room=${roomId}`);
    socketIO.to(roomId).emit(event, data);
    this.logger.log(`[emitToRoom] Emitted successfully`);
  }

  async emitToAll(event: string, data: unknown): Promise<void> {
    const socketIO = this.io.io;
    if (!socketIO) {
      this.logger.warn("Socket.IO instance not available for emit");
      return;
    }
    this.logger.log(`[emitToAll] Broadcasting event=${event}`);
    socketIO.emit(event, data);
    this.logger.log(`[emitToAll] Broadcasted successfully`);
  }
}
