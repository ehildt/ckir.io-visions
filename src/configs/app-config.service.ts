import { CacheReturnValue } from "@ehildt/ckir-config-factory";
import { AppConfigSchema } from "@ehildt/ckir-helpers";
import { Injectable } from "@nestjs/common";

import { AppConfigAdapter } from "./app-config.adapter";

@Injectable()
export class AppConfigService {
  @CacheReturnValue(AppConfigSchema)
  get config() {
    return AppConfigAdapter();
  }
}
