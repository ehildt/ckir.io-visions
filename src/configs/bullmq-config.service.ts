import {
  BullMQArgsAdapter,
  BullMQArgsSchema,
  BullMQConfigAdapter,
  BullMQConfigSchema,
} from "@ehildt/ckir-bullmq";
import {
  BullMQPinoAdapter,
  BullMQPinoLoggerSchema,
} from "@ehildt/ckir-bullmq-logger";
import { CacheReturnValue } from "@ehildt/ckir-config-factory";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BullMQConfigService {
  @CacheReturnValue(BullMQArgsSchema)
  get bullMQArgs() {
    return BullMQArgsAdapter();
  }

  @CacheReturnValue(BullMQConfigSchema)
  get bullMQConfig() {
    return BullMQConfigAdapter();
  }

  @CacheReturnValue(BullMQPinoLoggerSchema)
  get pinoConfig() {
    return BullMQPinoAdapter();
  }
}
