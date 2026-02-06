<h1 align="center">@CKIR.IO/VISIONS</h1>

<strong>@CKIR.IO/VISIONS</strong> allows uploading one or more images (PNG, JPG, JPEG, WEBP) and supports optional AI-driven description, comparison and text extraction via OCR. 
It exposes multiple REST endpoints and implements the Model Context Protocol (MCP) using the JSON‑RPC 2.0 transport. This microservice is originating from the ckir project collection.


<br>

## Dependencies
![@fastify/compress](https://img.shields.io/badge/_fastify_compress-v8.3.1-hsl(329%2C70%25%2C45%25).svg)
![@fastify/multipart](https://img.shields.io/badge/_fastify_multipart-v9.4.0-hsl(157%2C70%25%2C45%25).svg)
![@fastify/static](https://img.shields.io/badge/_fastify_static-v8.3.0-hsl(77%2C70%25%2C45%25).svg)
![@nestjs/bullmq](https://img.shields.io/badge/_nestjs_bullmq-v11.0.4-hsl(93%2C70%25%2C45%25).svg)
![@nestjs/common](https://img.shields.io/badge/_nestjs_common-v11.1.13-hsl(89%2C70%25%2C45%25).svg)
![@nestjs/core](https://img.shields.io/badge/_nestjs_core-v11.1.13-hsl(101%2C70%25%2C45%25).svg)
![@nestjs/microservices](https://img.shields.io/badge/_nestjs_microservices-v11.1.13-hsl(252%2C70%25%2C45%25).svg)
![@nestjs/platform-fastify](https://img.shields.io/badge/_nestjs_platform_fastify-v11.1.13-hsl(156%2C70%25%2C45%25).svg)
![@nestjs/swagger](https://img.shields.io/badge/_nestjs_swagger-v11.2.6-hsl(220%2C70%25%2C45%25).svg)
![@qdrant/js-client-rest](https://img.shields.io/badge/_qdrant_js_client_rest-v1.16.2-hsl(321%2C70%25%2C45%25).svg)
![bullmq](https://img.shields.io/badge/bullmq-v5.67.3-hsl(7%2C70%25%2C45%25).svg)
![class-transformer](https://img.shields.io/badge/class_transformer-v0.5.1-hsl(164%2C70%25%2C45%25).svg)
![class-validator](https://img.shields.io/badge/class_validator-v0.14.3-hsl(253%2C70%25%2C45%25).svg)
![date-fns](https://img.shields.io/badge/date_fns-v4.1.0-hsl(244%2C70%25%2C45%25).svg)
![fastify](https://img.shields.io/badge/fastify-v5.7.4-hsl(152%2C70%25%2C45%25).svg)
![ioredis](https://img.shields.io/badge/ioredis-v5.9.2-hsl(309%2C70%25%2C45%25).svg)
![joi](https://img.shields.io/badge/joi-v18.0.2-hsl(292%2C70%25%2C45%25).svg)
![ollama](https://img.shields.io/badge/ollama-v0.6.3-hsl(14%2C70%25%2C45%25).svg)
![pino](https://img.shields.io/badge/pino-v10.3.0-hsl(138%2C70%25%2C45%25).svg)
![pino-pretty](https://img.shields.io/badge/pino_pretty-v13.1.3-hsl(185%2C70%25%2C45%25).svg)
![reflect-metadata](https://img.shields.io/badge/reflect_metadata-v0.2.2-hsl(207%2C70%25%2C45%25).svg)
![rxjs](https://img.shields.io/badge/rxjs-v7.8.2-hsl(215%2C70%25%2C45%25).svg)

## DevDependencies
![@changesets/cli](https://img.shields.io/badge/_changesets_cli-v2.29.8-hsl(82%2C70%25%2C45%25).svg)
![@eslint/js](https://img.shields.io/badge/_eslint_js-v9.39.2-hsl(279%2C70%25%2C45%25).svg)
![@nestjs/cli](https://img.shields.io/badge/_nestjs_cli-v11.0.16-hsl(170%2C70%25%2C45%25).svg)
![@nestjs/schematics](https://img.shields.io/badge/_nestjs_schematics-v11.0.9-hsl(332%2C70%25%2C45%25).svg)
![@nestjs/testing](https://img.shields.io/badge/_nestjs_testing-v11.1.13-hsl(354%2C70%25%2C45%25).svg)
![@types/eslint](https://img.shields.io/badge/_types_eslint-v9.6.1-hsl(303%2C70%25%2C45%25).svg)
![@types/jest](https://img.shields.io/badge/_types_jest-v30.0.0-hsl(218%2C70%25%2C45%25).svg)
![@types/node](https://img.shields.io/badge/_types_node-v24.10.11-hsl(352%2C70%25%2C45%25).svg)
![@types/supertest](https://img.shields.io/badge/_types_supertest-v6.0.3-hsl(319%2C70%25%2C45%25).svg)
![depcheck](https://img.shields.io/badge/depcheck-v1.4.7-hsl(145%2C70%25%2C45%25).svg)
![dependency-cruiser](https://img.shields.io/badge/dependency_cruiser-v17.3.7-hsl(355%2C70%25%2C45%25).svg)
![dotenv-cli](https://img.shields.io/badge/dotenv_cli-v11.0.0-hsl(335%2C70%25%2C45%25).svg)
![eslint](https://img.shields.io/badge/eslint-v9.39.2-hsl(249%2C70%25%2C45%25).svg)
![eslint-config-prettier](https://img.shields.io/badge/eslint_config_prettier-v10.1.8-hsl(42%2C70%25%2C45%25).svg)
![eslint-plugin-prettier](https://img.shields.io/badge/eslint_plugin_prettier-v5.5.5-hsl(41%2C70%25%2C45%25).svg)
![eslint-plugin-simple-import-sort](https://img.shields.io/badge/eslint_plugin_simple_import_sort-v12.1.1-hsl(113%2C70%25%2C45%25).svg)
![eslint-plugin-sonarjs](https://img.shields.io/badge/eslint_plugin_sonarjs-v3.0.6-hsl(334%2C70%25%2C45%25).svg)
![globals](https://img.shields.io/badge/globals-v16.5.0-hsl(208%2C70%25%2C45%25).svg)
![husky](https://img.shields.io/badge/husky-v9.1.7-hsl(204%2C70%25%2C45%25).svg)
![jest](https://img.shields.io/badge/jest-v30.2.0-hsl(228%2C70%25%2C45%25).svg)
![jest-extended](https://img.shields.io/badge/jest_extended-v6.0.0-hsl(26%2C70%25%2C45%25).svg)
![jest-junit](https://img.shields.io/badge/jest_junit-v16.0.0-hsl(93%2C70%25%2C45%25).svg)
![jiti](https://img.shields.io/badge/jiti-v2.6.1-hsl(132%2C70%25%2C45%25).svg)
![js-yaml](https://img.shields.io/badge/js_yaml-v4.1.1-hsl(259%2C70%25%2C45%25).svg)
![lint-staged](https://img.shields.io/badge/lint_staged-v16.2.7-hsl(48%2C70%25%2C45%25).svg)
![npm-check-updates](https://img.shields.io/badge/npm_check_updates-v19.3.2-hsl(131%2C70%25%2C45%25).svg)
![rimraf](https://img.shields.io/badge/rimraf-v6.1.2-hsl(145%2C70%25%2C45%25).svg)
![source-map-support](https://img.shields.io/badge/source_map_support-v0.5.21-hsl(124%2C70%25%2C45%25).svg)
![supertest](https://img.shields.io/badge/supertest-v7.2.2-hsl(317%2C70%25%2C45%25).svg)
![ts-jest](https://img.shields.io/badge/ts_jest-v29.4.6-hsl(194%2C70%25%2C45%25).svg)
![ts-loader](https://img.shields.io/badge/ts_loader-v9.5.4-hsl(225%2C70%25%2C45%25).svg)
![ts-node](https://img.shields.io/badge/ts_node-v10.9.2-hsl(328%2C70%25%2C45%25).svg)
![ts-unused-exports](https://img.shields.io/badge/ts_unused_exports-v11.0.1-hsl(262%2C70%25%2C45%25).svg)
![tsconfig-paths](https://img.shields.io/badge/tsconfig_paths-v4.2.0-hsl(282%2C70%25%2C45%25).svg)
![typescript](https://img.shields.io/badge/typescript-v5.9.3-hsl(253%2C70%25%2C45%25).svg)
![typescript-eslint](https://img.shields.io/badge/typescript_eslint-v8.54.0-hsl(345%2C70%25%2C45%25).svg)

## InternalDependencies
![@ehildt/ckir-bullmq](https://img.shields.io/badge/_ehildt_ckir_bullmq-v0.1.17-hsl(154%2C70%25%2C45%25).svg)
![@ehildt/ckir-bullmq-logger](https://img.shields.io/badge/_ehildt_ckir_bullmq_logger-v0.1.14-hsl(219%2C70%25%2C45%25).svg)
![@ehildt/ckir-config-factory](https://img.shields.io/badge/_ehildt_ckir_config_factory-v0.1.9-hsl(82%2C70%25%2C45%25).svg)
![@ehildt/ckir-helpers](https://img.shields.io/badge/_ehildt_ckir_helpers-v0.1.22-hsl(346%2C70%25%2C45%25).svg)
![@ehildt/ckir-ollama](https://img.shields.io/badge/_ehildt_ckir_ollama-v0.1.12-hsl(161%2C70%25%2C45%25).svg)
![@ehildt/ckir-qdrant](https://img.shields.io/badge/_ehildt_ckir_qdrant-v0.1.8-hsl(91%2C70%25%2C45%25).svg)
![@ehildt/ckir-socket-io](https://img.shields.io/badge/_ehildt_ckir_socket_io-v0.1.17-hsl(325%2C70%25%2C45%25).svg)


<br>

<p align="center">
  <a href="mailto:eugen.hildt@gmail.com">Contact</a> | <a href="https://github.com/ehildt/ckir.io-visions/wiki">Wiki</a>
</p>
