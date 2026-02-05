import { BullMQLoggerModule } from "@ehildt/nestjs-bullmq-logger/module";
import { ConfigFactoryModule } from "@ehildt/nestjs-config-factory/config-factory";
import { OllamaModule } from "@ehildt/nestjs-ollama/module";
import { SocketIOModule } from "@ehildt/nestjs-socket.io";
import { Logger, Module } from "@nestjs/common";

import { AppConfigService } from "./configs/app-config.service.js";
import { BullMQConfigService } from "./configs/bullmq-config.service.js";
import { BullMQLoggerConfigService } from "./configs/bullmq-logger-config.service.js";
import { OllamaConfigService } from "./configs/ollama-config.service.js";
import { SocketIOConfigService } from "./configs/socket-io-config.service.js";

@Module({
  controllers: [
    // ClassicController,
    // JsonRpcController
  ],
  providers: [
    Logger,
    // AnalyzeImageService,
    // JsonRpcService
  ],
  imports: [
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
  ],
})
export class MainModule {}
