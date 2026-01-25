import { CacheReturnValue } from "@ehildt/ckir-config-factory";
import { SocketIOAdapter, SocketIOConfigSchema } from "@ehildt/ckir-socket-io";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SocketIOConfigService {
  @CacheReturnValue(SocketIOConfigSchema)
  get config() {
    return SocketIOAdapter("vision");
  }
}
