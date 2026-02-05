import { CacheReturnValue } from "@ehildt/nestjs-config-factory/cache-return-value";
import { OllamaConfigSchema } from "@ehildt/nestjs-ollama/schema";
import { Injectable } from "@nestjs/common";
import Joi from "joi";
import { Config } from "ollama";

import { OllamaConfigAdapter } from "./ollama-config.adapter.js";

const extendedSchema = OllamaConfigSchema.concat(
  Joi.object({ keepAlive: Joi.string().optional() }),
);

@Injectable()
export class OllamaConfigService {
  @CacheReturnValue(extendedSchema)
  get config(): Config & { keepAlive: string } {
    return OllamaConfigAdapter();
  }
}
