import { CacheReturnValue } from "@ehildt/nestjs-config-factory/cache-return-value";
import { Injectable } from "@nestjs/common";

import { OllamaService } from "@ehildt/nestjs-ollama";

@Injectable()
export class OllamaModelsService {
  constructor(private readonly ollamaService: OllamaService) {}

  @CacheReturnValue({ ttl: 60 })
  async getModels() {
    return this.ollamaService.list();
  }
}