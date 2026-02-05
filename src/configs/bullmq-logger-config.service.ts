import { BullMQLoggerSchema } from "@ehildt/nestjs-bullmq-logger/schema";
import { CacheReturnValue } from "@ehildt/nestjs-config-factory/cache-return-value";
import { Injectable } from "@nestjs/common";
import type { LoggerOptions } from "pino";

import { BullMQLoggerConfigAdapter } from "./bullmq-logger-config.adapter.js";

@Injectable()
export class BullMQLoggerConfigService {
  @CacheReturnValue(BullMQLoggerSchema)
  get config(): LoggerOptions {
    console.log("[TESTING] CacheReturnValue in BullMQLoggerConfigService");
    return BullMQLoggerConfigAdapter();
  }
}
