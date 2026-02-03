import { CacheReturnValue } from "@ehildt/ckir-config-factory";
import { OllamaConfigAdapter, OllamaConfigSchema } from "@ehildt/ckir-ollama";
import { Injectable } from "@nestjs/common";
import Joi from "joi";

const extendedSchema = OllamaConfigSchema.concat(
  Joi.object({ keepAlive: Joi.string().optional() }),
);

@Injectable()
export class OllamaConfigService {
  @CacheReturnValue(extendedSchema)
  get config() {
    return {
      ...OllamaConfigAdapter(),
      keepAlive: process.env.OLLAMA_KEEP_ALIVE,
    };
  }
}
