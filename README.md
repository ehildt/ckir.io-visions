<h1 align="center">@CKIR.IO/VISIONS</h1>

<strong>@CKIR.IO/VISIONS</strong> allows uploading one or more images (PNG, JPG, JPEG, WEBP) and supports optional AI-driven description, comparison and text extraction via OCR. 
It exposes multiple REST endpoints and implements the Model Context Protocol (MCP) using the JSON‑RPC 2.0 transport. This microservice is originating from the ckir project collection.


<br>

<!-- DEPBADGE:START -->
<div align="center">

![github](https://img.shields.io/github/release/ehildt/ckir.io--visions?labelColor=%23333&style=for-the-badge&cacheSeconds=3600&color=b16425&logo=github&logoColor=b16425&logoWidth=40&branch=main)
![github](https://img.shields.io/github/stars/ehildt/ckir.io--visions?labelColor=%23333&style=for-the-badge&cacheSeconds=3600&color=b16425&logo=github&logoColor=b16425&logoWidth=40&branch=main)
![github](https://img.shields.io/github/license/ehildt/ckir.io--visions?labelColor=%23333&style=for-the-badge&cacheSeconds=3600&color=b16425&logo=github&logoColor=b16425&logoWidth=40&branch=main)
![codecov](https://img.shields.io/codecov/c/github/ehildt/ckir.io--visions?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=4021b0&logoWidth=40&style=for-the-badge&color=4021b0&branch=main)

</div>

<br>

<div align="center">

[![@ehildt/ckir-bullmq](https://img.shields.io/badge/_ehildt_ckir_bullmq-v0.1.17-32cd8a.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=32cd8a&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![@ehildt/ckir-bullmq-logger](https://img.shields.io/badge/_ehildt_ckir_bullmq_logger-v0.1.14-2b5ab1.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=2b5ab1&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![@ehildt/ckir-config-factory](https://img.shields.io/badge/_ehildt_ckir_config_factory-v0.1.9-82b823.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=82b823&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![@ehildt/ckir-helpers](https://img.shields.io/badge/_ehildt_ckir_helpers-v0.1.22-a82947.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=a82947&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![@ehildt/ckir-ollama](https://img.shields.io/badge/_ehildt_ckir_ollama-v0.1.12-2acb98.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=2acb98&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![@ehildt/ckir-qdrant](https://img.shields.io/badge/_ehildt_ckir_qdrant-v0.1.8-7aca2f.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=7aca2f&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![@ehildt/ckir-socket-io](https://img.shields.io/badge/_ehildt_ckir_socket_io-v0.1.17-c22982.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=c22982&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![@fastify/compress](https://img.shields.io/badge/_fastify_compress-v8.3.1-c62478.svg?labelColor=%23333&cacheSeconds=3600&logo=fastify&logoColor=c62478&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![@fastify/multipart](https://img.shields.io/badge/_fastify_multipart-v9.4.0-3dd198.svg?labelColor=%23333&cacheSeconds=3600&logo=fastify&logoColor=3dd198&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![@fastify/static](https://img.shields.io/badge/_fastify_static-v8.3.0-8ab61b.svg?labelColor=%23333&cacheSeconds=3600&logo=fastify&logoColor=8ab61b&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![@nestjs/bullmq](https://img.shields.io/badge/_nestjs_bullmq-v11.0.4-69b927.svg?labelColor=%23333&cacheSeconds=3600&logo=nestjs&logoColor=69b927&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![@nestjs/common](https://img.shields.io/badge/_nestjs_common-v11.1.16-88de2b.svg?labelColor=%23333&cacheSeconds=3600&logo=nestjs&logoColor=88de2b&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![@nestjs/core](https://img.shields.io/badge/_nestjs_core-v11.1.16-4fc219.svg?labelColor=%23333&cacheSeconds=3600&logo=nestjs&logoColor=4fc219&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![@nestjs/microservices](https://img.shields.io/badge/_nestjs_microservices-v11.1.16-4628bd.svg?labelColor=%23333&cacheSeconds=3600&logo=nestjs&logoColor=4628bd&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![@nestjs/platform-fastify](https://img.shields.io/badge/_nestjs_platform_fastify-v11.1.16-33cc8f.svg?labelColor=%23333&cacheSeconds=3600&logo=nestjs&logoColor=33cc8f&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![@nestjs/swagger](https://img.shields.io/badge/_nestjs_swagger-v11.2.6-225fd8.svg?labelColor=%23333&cacheSeconds=3600&logo=nestjs&logoColor=225fd8&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![@qdrant/js-client-rest](https://img.shields.io/badge/_qdrant_js_client_rest-v1.17.0-dd279d.svg?labelColor=%23333&cacheSeconds=3600&logo=qdrant&logoColor=dd279d&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![bullmq](https://img.shields.io/badge/bullmq-v5.70.4-e03a24.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=e03a24&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![class-transformer](https://img.shields.io/badge/class_transformer-v0.5.1-2bc59c.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=2bc59c&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![class-validator](https://img.shields.io/badge/class_validator-v0.15.1-461ddd.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=461ddd&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![date-fns](https://img.shields.io/badge/date_fns-v4.1.0-271ad5.svg?labelColor=%23333&cacheSeconds=3600&logo=datefns&logoColor=271ad5&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![fastify](https://img.shields.io/badge/fastify-v5.8.2-29db88.svg?labelColor=%23333&cacheSeconds=3600&logo=fastify&logoColor=29db88&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![ioredis](https://img.shields.io/badge/ioredis-v5.10.0-b0219a.svg?labelColor=%23333&cacheSeconds=3600&logo=redis&logoColor=b0219a&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![joi](https://img.shields.io/badge/joi-v18.0.2-9f1eb3.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=9f1eb3&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![ollama](https://img.shields.io/badge/ollama-v0.6.3-e0481a.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=e0481a&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![pino](https://img.shields.io/badge/pino-v10.3.1-2fc15b.svg?labelColor=%23333&cacheSeconds=3600&logo=pino&logoColor=2fc15b&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![pino-pretty](https://img.shields.io/badge/pino_pretty-v13.1.3-28acb8.svg?labelColor=%23333&cacheSeconds=3600&logo=pino&logoColor=28acb8&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![reflect-metadata](https://img.shields.io/badge/reflect_metadata-v0.2.2-2489db.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=2489db&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)
[![rxjs](https://img.shields.io/badge/rxjs-v7.8.2-256cd0.svg?labelColor=%23333&cacheSeconds=3600&logo=rxjs&logoColor=256cd0&logoWidth=40&style=for-the-badge)](https://www.npmjs.com/package/example_package)

</div>

<br>

<div align="center">

[![@changesets/cli](https://img.shields.io/badge/_changesets_cli-v2.30.0-82ba21.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=82ba21&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![@eslint/js](https://img.shields.io/badge/_eslint_js-v9.39.4-7a23a9.svg?labelColor=%23333&cacheSeconds=3600&logo=eslint&logoColor=7a23a9&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![@nestjs/cli](https://img.shields.io/badge/_nestjs_cli-v11.0.16-2dc8ae.svg?labelColor=%23333&cacheSeconds=3600&logo=nestjs&logoColor=2dc8ae&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![@nestjs/schematics](https://img.shields.io/badge/_nestjs_schematics-v11.0.9-d01b6f.svg?labelColor=%23333&cacheSeconds=3600&logo=nestjs&logoColor=d01b6f&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![@nestjs/testing](https://img.shields.io/badge/_nestjs_testing-v11.1.16-c02635.svg?labelColor=%23333&cacheSeconds=3600&logo=nestjs&logoColor=c02635&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![@types/eslint](https://img.shields.io/badge/_types_eslint-v9.6.1-d936d0.svg?labelColor=%23333&cacheSeconds=3600&logo=eslint&logoColor=d936d0&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![@types/jest](https://img.shields.io/badge/_types_jest-v30.0.0-1c5bca.svg?labelColor=%23333&cacheSeconds=3600&logo=jest&logoColor=1c5bca&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![@types/node](https://img.shields.io/badge/_types_node-v24.12.0-d51a33.svg?labelColor=%23333&cacheSeconds=3600&logo=node&logoColor=d51a33&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![@types/supertest](https://img.shields.io/badge/_types_supertest-v6.0.3-b41882.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=b41882&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![depcheck](https://img.shields.io/badge/depcheck-v1.4.7-28a95e.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=28a95e&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![dependency-cruiser](https://img.shields.io/badge/dependency_cruiser-v17.3.8-c22431.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=c22431&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![dotenv-cli](https://img.shields.io/badge/dotenv_cli-v11.0.0-d53074.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=d53074&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![eslint](https://img.shields.io/badge/eslint-v9.39.4-3f2ab7.svg?labelColor=%23333&cacheSeconds=3600&logo=eslint&logoColor=3f2ab7&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![eslint-config-prettier](https://img.shields.io/badge/eslint_config_prettier-v10.1.8-c4921c.svg?labelColor=%23333&cacheSeconds=3600&logo=prettier&logoColor=c4921c&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![eslint-plugin-prettier](https://img.shields.io/badge/eslint_plugin_prettier-v5.5.5-d19d2e.svg?labelColor=%23333&cacheSeconds=3600&logo=prettier&logoColor=d19d2e&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![eslint-plugin-simple-import-sort](https://img.shields.io/badge/eslint_plugin_simple_import_sort-v12.1.1-39d025.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=39d025&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![eslint-plugin-sonarjs](https://img.shields.io/badge/eslint_plugin_sonarjs-v3.0.7-ca216a.svg?labelColor=%23333&cacheSeconds=3600&logo=sonar&logoColor=ca216a&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![globals](https://img.shields.io/badge/globals-v16.5.0-2570b1.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=2570b1&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![husky](https://img.shields.io/badge/husky-v9.1.7-2e81b8.svg?labelColor=%23333&cacheSeconds=3600&logo=husky&logoColor=2e81b8&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![jest](https://img.shields.io/badge/jest-v30.2.0-2442bc.svg?labelColor=%23333&cacheSeconds=3600&logo=jest&logoColor=2442bc&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![jest-extended](https://img.shields.io/badge/jest_extended-v6.0.0-db701f.svg?labelColor=%23333&cacheSeconds=3600&logo=jest&logoColor=db701f&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![jest-junit](https://img.shields.io/badge/jest_junit-v16.0.0-6fd31d.svg?labelColor=%23333&cacheSeconds=3600&logo=jest&logoColor=6fd31d&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![jiti](https://img.shields.io/badge/jiti-v2.6.1-2ab746.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=2ab746&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![js-yaml](https://img.shields.io/badge/js_yaml-v4.1.1-6c3ad9.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=6c3ad9&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![lint-staged](https://img.shields.io/badge/lint_staged-v16.3.2-dfba26.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=dfba26&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![npm-check-updates](https://img.shields.io/badge/npm_check_updates-v19.6.3-1ec23c.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=1ec23c&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![rimraf](https://img.shields.io/badge/rimraf-v6.1.3-24a85b.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=24a85b&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![source-map-support](https://img.shields.io/badge/source_map_support-v0.5.21-2ecc39.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=2ecc39&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![supertest](https://img.shields.io/badge/supertest-v7.2.2-de21a8.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=de21a8&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![ts-jest](https://img.shields.io/badge/ts_jest-v29.4.6-1aa2cb.svg?labelColor=%23333&cacheSeconds=3600&logo=jest&logoColor=1aa2cb&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![ts-loader](https://img.shields.io/badge/ts_loader-v9.5.4-1e46be.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=1e46be&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![ts-node](https://img.shields.io/badge/ts_node-v10.9.2-c51b76.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=c51b76&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![ts-unused-exports](https://img.shields.io/badge/ts_unused_exports-v11.0.1-5e26c0.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=5e26c0&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![tsconfig-paths](https://img.shields.io/badge/tsconfig_paths-v4.2.0-a025d4.svg?labelColor=%23333&cacheSeconds=3600&logo=npm&logoColor=a025d4&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![typescript](https://img.shields.io/badge/typescript-v5.9.3-4c2eb8.svg?labelColor=%23333&cacheSeconds=3600&logo=typescript&logoColor=4c2eb8&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)
[![typescript-eslint](https://img.shields.io/badge/typescript_eslint-v8.56.1-dc2e59.svg?labelColor=%23333&cacheSeconds=3600&logo=eslint&logoColor=dc2e59&logoWidth=40&style=flat-square)](https://www.npmjs.com/package/example_package)

</div>
<!-- DEPBADGE:END -->


<br>

<p align="center">
  <a href="mailto:eugen.hildt@gmail.com">Contact</a> | <a href="https://github.com/ehildt/ckir.io-visions/wiki">Wiki</a>
</p>


