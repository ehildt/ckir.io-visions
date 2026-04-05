import {
  API_DOCS,
  getBodyLimit,
  getLogLevel,
  logConfigObject,
  logServerPath,
  logSwaggerPath,
  SWAGGER_DOCUMENT,
  VALIDATION_PIPE,
} from "@ehildt/ckir-helpers/bootstrap";
import { SocketIOModule } from "@ehildt/nestjs-socket.io";
import { SocketIOService } from "@ehildt/nestjs-socket.io";
import compress from "@fastify/compress";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { Logger, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { SwaggerModule } from "@nestjs/swagger";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { AppConfigService } from "./configs/app-config.service.js";
import { MainModule } from "./main.module.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

void (async () => {
  const logger = { logger: getLogLevel(process.env.LOG_LEVEL) };
  const adapter = new FastifyAdapter({
    bodyLimit: getBodyLimit(process.env.BODY_LIMIT),
  });

  const APP = await NestFactory.create<NestFastifyApplication>(
    MainModule,
    adapter,
    logger,
  );

  await SocketIOModule.attach(APP);
  APP.get(SocketIOService);

  const appConfigService = APP.get(AppConfigService);
  await APP.register(fastifyMultipart as any, { attachFieldsToBody: true });
  await APP.register(compress as any, {
    threshold: 1024, // minimum payload size to compress
    encodings: ["br", "gzip"], // optional: restrict Brotli/gzip
    global: true, // default behavior – compress all
  });

  // Serve static dashboard files
  await APP.register(fastifyStatic as any, {
    root: join(__dirname, "..", "dashboard", "dist"),
    prefix: "/dashboard/",
    wildcard: false,
  });

  // Get underlying Fastify instance
  const fastifyInstance = APP.getHttpAdapter().getInstance();

  // SPA fallback - serve index.html for any /dashboard/* routes not found
  fastifyInstance.get("/dashboard/*", async (_request: any, reply: any) => {
    return reply.sendFile(
      "index.html",
      join(__dirname, "..", "dashboard", "dist"),
    );
  });

  // Redirect root to dashboard
  fastifyInstance.get("/", async (_request: any, reply: any) => {
    return reply.redirect("/dashboard/");
  });

  APP.enableCors(appConfigService.config.cors);
  APP.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
    prefix: "api/v",
  });

  APP.useGlobalPipes(VALIDATION_PIPE);
  APP.enableShutdownHooks(["SIGINT", "SIGTERM", "SIGQUIT"]);
  const swaggerDocument = SwaggerModule.createDocument(APP, SWAGGER_DOCUMENT);
  SwaggerModule.setup(API_DOCS, APP, swaggerDocument);

  await APP.listen(
    {
      port: appConfigService.config.port,
      host: appConfigService.config.address,
    },
    () => {
      const nestLogger = APP.get(Logger);
      logConfigObject(nestLogger, appConfigService.config);
      logServerPath(nestLogger, appConfigService.config);
      logSwaggerPath(nestLogger, appConfigService.config);
    },
  );
})();
