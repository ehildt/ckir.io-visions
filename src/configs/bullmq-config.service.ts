import { BullMQConfig } from "@ehildt/nestjs-bullmq/models";
import { BullMQConfigSchema } from "@ehildt/nestjs-bullmq/schema";
import { CacheReturnValue } from "@ehildt/nestjs-config-factory/cache-return-value";
import { Injectable } from "@nestjs/common";

import { BullMQConfigAdapter } from "./bullmq-config.adapter.js";

@Injectable()
export class BullMQConfigService {
  @CacheReturnValue(BullMQConfigSchema)
  get config(): BullMQConfig {
    console.log("[TESTING] CacheReturnValue in BullMQConfigAdapter");
    return BullMQConfigAdapter();
  }
}
