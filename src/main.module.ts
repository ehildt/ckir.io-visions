import { BULLMQ_QUEUE, BullMQModule } from "@ehildt/ckir-bullmq";
import { BullMQPinoLoggerModule } from "@ehildt/ckir-bullmq-logger";
import { ConfigFactoryModule } from "@ehildt/ckir-config-factory";
import { OllamaModule } from "@ehildt/ckir-ollama";
import { SocketIOModule } from "@ehildt/ckir-socket-io";
import { Logger, Module } from "@nestjs/common";

import { AppConfigService } from "./configs/app-config.service";
import { BullMQConfigService } from "./configs/bullmq-config.service";
import { OllamaConfigService } from "./configs/ollama-config.service";
import { SocketIOConfigService } from "./configs/socket-io-config.service";
import { ClassicController } from "./controllers/classic.controller";
import { JsonRpcController } from "./controllers/json-rpc.controller";
import { VisionsCompareProcessor } from "./processors/visions-compare.processor";
import { VisionsDescribeProcessor } from "./processors/visions-describe.processor";
import { VisionsOCRProcessor } from "./processors/visions-ocr.processor";
import { AnalyzeImageService } from "./services/analyze-image.service";
import { JsonRpcService } from "./services/json-rpc.service";

@Module({
  controllers: [ClassicController, JsonRpcController],
  providers: [Logger, AnalyzeImageService, JsonRpcService],
  imports: [
    ConfigFactoryModule.forRoot({
      global: true,
      providers: [
        AppConfigService,
        BullMQConfigService,
        OllamaConfigService,
        SocketIOConfigService,
      ],
    }),
    // ! REFINE ollama vs llama.cpp
    // ollama comes with queues, slight overhead
    // llama.cpp offers god mode, needs tweaking
    OllamaModule.registerAsync({
      global: true,
      inject: [OllamaConfigService],
      useFactory: async ({ config }: OllamaConfigService) => config,
    }),
    BullMQModule.registerAsync({
      global: true,
      inject: [BullMQConfigService],
      queues: [
        BULLMQ_QUEUE.IMAGE_OCR,
        BULLMQ_QUEUE.IMAGE_COMPARE,
        BULLMQ_QUEUE.IMAGE_DESCRIBE,
      ],
      processors: [
        VisionsDescribeProcessor,
        VisionsCompareProcessor,
        VisionsOCRProcessor,
      ],
      useBullFactory: async ({ bullMQConfig }: BullMQConfigService) =>
        bullMQConfig,
    }),
    BullMQPinoLoggerModule.registerAsync({
      global: true,
      inject: [BullMQConfigService],
      useFactory: async ({ pinoConfig }: BullMQConfigService) => pinoConfig,
    }),
    SocketIOModule.registerAsync({
      global: true,
      inject: [SocketIOConfigService],
      useFactory: async ({ config }: SocketIOConfigService) => config,
    }),
  ],
})
export class MainModule {}
