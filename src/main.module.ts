import { BullMQModule } from "@ehildt/nestjs-bullmq";
import { BullMQLoggerModule } from "@ehildt/nestjs-bullmq-logger";
import { ConfigFactoryModule } from "@ehildt/nestjs-config-factory/config-factory";
import { OllamaModule } from "@ehildt/nestjs-ollama";
import { SocketIOModule } from "@ehildt/nestjs-socket.io";
import { HttpModule } from "@nestjs/axios";
import { Logger, Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";

import { AppConfigService } from "./configs/app-config.service.js";
import { BullMQConfigService } from "./configs/bullmq-config.service.js";
import { BullMQLoggerConfigService } from "./configs/bullmq-logger-config.service.js";
import { OllamaConfigService } from "./configs/ollama-config.service.js";
import { SocketIOConfigService } from "./configs/socket-io-config.service.js";
import { BULLMQ_QUEUE } from "./constants/bullmq.constants.js";
import { ClassicController } from "./controllers/classic.controller.js";
import { HealthController } from "./controllers/health.controller.js";
import { JsonRpcController } from "./controllers/json-rpc.controller.js";
import { SocketEventModule } from "./modules/socket-event.module.js";
import { VisionsCompareProcessor } from "./processors/visions-compare.processor.js";
import { VisionsDescribeProcessor } from "./processors/visions-describe.processor.js";
import { VisionsOCRProcessor } from "./processors/visions-ocr.processor.js";
import { AnalyzeImageService } from "./services/analyze-image.service.js";
import { HealthService } from "./services/health.service.js";
import { JsonRpcService } from "./services/json-rpc.service.js";
import { OllamaModelsService } from "./services/ollama-models.service.js";
import { SocketService } from "./services/socket.service.js";

@Module({
  controllers: [ClassicController, JsonRpcController, HealthController],
  providers: [
    Logger,
    AnalyzeImageService,
    HealthService,
    JsonRpcService,
    OllamaModelsService,
    SocketService,
  ],
  imports: [
    HttpModule,
    SocketEventModule,
    TerminusModule.forRoot({
      errorLogStyle: "pretty",
    }),
    ConfigFactoryModule.forRoot({
      global: true,
      providers: [
        AppConfigService,
        BullMQConfigService,
        BullMQLoggerConfigService,
        OllamaConfigService,
        SocketIOConfigService,
      ],
    }),
    SocketIOModule.registerAsync({
      global: true,
      inject: [SocketIOConfigService],
      useFactory: async ({ config }: SocketIOConfigService) => config,
    }),
    OllamaModule.registerAsync({
      global: true,
      inject: [OllamaConfigService],
      useFactory: async ({ config }: OllamaConfigService) => config,
    }),
    BullMQLoggerModule.registerAsync({
      global: true,
      inject: [BullMQLoggerConfigService],
      useFactory: async ({ config }: BullMQLoggerConfigService) => config,
    }),
    BullMQModule.registerAsync({
      global: true,
      inject: [BullMQConfigService],
      useFactory: async ({ config }: BullMQConfigService) => config,
      processors: [
        VisionsDescribeProcessor,
        VisionsCompareProcessor,
        VisionsOCRProcessor,
      ],
      queues: [
        BULLMQ_QUEUE.IMAGE_OCR,
        BULLMQ_QUEUE.IMAGE_COMPARE,
        BULLMQ_QUEUE.IMAGE_DESCRIBE,
      ],
    }),
  ],
})
export class MainModule {}
