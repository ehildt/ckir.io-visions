import {
  API_DOCS,
  BODY_LIMIT,
  LOG_LEVEL,
  logConfigObject,
  logServerPath,
  logSwaggerPath,
  SWAGGER_DOCUMENT,
  VALIDATION_PIPE,
} from "@ehildt/ckir-helpers";
import compress from "@fastify/compress";
import fastifyMultipart from "@fastify/multipart";
import { Logger, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { SwaggerModule } from "@nestjs/swagger";

import { AppConfigService } from "./configs/app-config.service";
import { MainModule } from "./main.module";

void (async () => {
  const logger = { logger: LOG_LEVEL };
  const adapter = new FastifyAdapter({ bodyLimit: BODY_LIMIT });
  const APP = await NestFactory.create<NestFastifyApplication>(
    MainModule,
    adapter,
    logger,
  );
  const appConfigService = APP.get(AppConfigService);
  await APP.register(fastifyMultipart as any, { attachFieldsToBody: true });
  await APP.register(compress as any, {
    threshold: 1024, // minimum payload size to compress
    encodings: ["br", "gzip"], // optional: restrict Brotli/gzip
    global: true, // default behavior – compress all
  });
  APP.enableCors(appConfigService.config.cors);
  APP.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
    prefix: "api/v",
  });
  APP.useGlobalPipes(VALIDATION_PIPE);
  APP.enableShutdownHooks(["SIGINT", "SIGTERM", "SIGQUIT"]);
  SwaggerModule.setup(
    API_DOCS,
    APP,
    SwaggerModule.createDocument(APP, SWAGGER_DOCUMENT),
  );
  await APP.listen(
    {
      port: appConfigService.config.port,
      host: appConfigService.config.address,
    },
    () => {
      const nestLogger = APP.get(Logger);
      logConfigObject(nestLogger, appConfigService);
      logServerPath(nestLogger, appConfigService.config);
      logSwaggerPath(nestLogger, appConfigService.config);
    },
  );
})();
