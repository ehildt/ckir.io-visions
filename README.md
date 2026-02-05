<h1 align="center">@CKIR.IO/VISIONS</h1>

<strong>@CKIR.IO/VISIONS</strong> allows uploading one or more images (PNG, JPG, JPEG, WEBP) and supports optional AI-driven description, comparison and text extraction via OCR. 
It exposes multiple REST endpoints and implements the Model Context Protocol (MCP) using the JSON‑RPC 2.0 transport. This microservice is originating from the ckir project collection.


<br>

## Dependencies

<!-- Dependencies badges -->
![@ehildt/ckir-bullmq](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40ehildt%2Fckir-bullmq)
![@ehildt/ckir-bullmq-logger](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40ehildt%2Fckir-bullmq-logger)
![@ehildt/ckir-config-factory](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40ehildt%2Fckir-config-factory)
![@ehildt/ckir-helpers](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40ehildt%2Fckir-helpers)
![@ehildt/ckir-ollama](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40ehildt%2Fckir-ollama)
![@ehildt/ckir-qdrant](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40ehildt%2Fckir-qdrant)
![@ehildt/ckir-socket-io](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40ehildt%2Fckir-socket-io)
![@fastify/compress](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40fastify%2Fcompress)
![@fastify/multipart](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40fastify%2Fmultipart)
![@fastify/static](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40fastify%2Fstatic)
![@nestjs/bullmq](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40nestjs%2Fbullmq)
![@nestjs/common](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40nestjs%2Fcommon)
![@nestjs/core](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40nestjs%2Fcore)
![@nestjs/microservices](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40nestjs%2Fmicroservices)
![@nestjs/platform-fastify](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40nestjs%2Fplatform-fastify)
![@nestjs/swagger](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40nestjs%2Fswagger)
![@qdrant/js-client-rest](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40qdrant%2Fjs-client-rest)
![bullmq](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.bullmq)
![class-transformer](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.class-transformer)
![class-validator](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.class-validator)
![date-fns](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.date-fns)
![fastify](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.fastify)
![ioredis](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.ioredis)
![joi](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.joi)
![ollama](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.ollama)
![pino](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.pino)
![pino-pretty](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.pino-pretty)
![reflect-metadata](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.reflect-metadata)
![rxjs](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.rxjs)

## Dev Dependencies

<!-- DevDependencies badges -->
![@changesets/cli](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40changesets%2Fcli)
![@eslint/js](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40eslint%2Fjs)
![@nestjs/cli](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40nestjs%2Fcli)
![@nestjs/schematics](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40nestjs%2Fschematics)
![@nestjs/testing](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40nestjs%2Ftesting)
![@types/eslint](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40types%2Feslint)
![@types/jest](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40types%2Fjest)
![@types/node](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40types%2Fnode)
![@types/supertest](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.%40types%2Fsupertest)
![depcheck](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.depcheck)
![dependency-cruiser](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.dependency-cruiser)
![dotenv-cli](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.dotenv-cli)
![eslint](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.eslint)
![eslint-config-prettier](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.eslint-config-prettier)
![eslint-plugin-prettier](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.eslint-plugin-prettier)
![eslint-plugin-simple-import-sort](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.eslint-plugin-simple-import-sort)
![eslint-plugin-sonarjs](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.eslint-plugin-sonarjs)
![globals](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.globals)
![husky](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.husky)
![jest](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.jest)
![jest-extended](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.jest-extended)
![jest-junit](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.jest-junit)
![jiti](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.jiti)
![js-yaml](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.js-yaml)
![lint-staged](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.lint-staged)
![npm-check-updates](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.npm-check-updates)
![rimraf](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.rimraf)
![source-map-support](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.source-map-support)
![supertest](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.supertest)
![ts-jest](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.ts-jest)
![ts-loader](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.ts-loader)
![ts-node](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.ts-node)
![ts-unused-exports](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.ts-unused-exports)
![tsconfig-paths](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.tsconfig-paths)
![typescript](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.typescript)
![typescript-eslint](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ehildt/ckir.io-visions/main/badges.json&query=$.typescript-eslint)


<br>

<p align="center">
  <a href="mailto:eugen.hildt@gmail.com">Contact</a> | <a href="https://github.com/ehildt/ckir.io-visions/wiki">Wiki</a>
</p>
