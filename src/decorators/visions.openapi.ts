import { applyDecorators, HttpStatus } from "@nestjs/common";
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";

import { BATCH_ID, NUM_CTX, ROOM_ID, STREAM, X_VISION_LLM } from "./constants";

import { VisionTask } from "@/dtos/classic/get-fastify-multipart-data-req.dto";

export const ApiQueryStream = () =>
  ApiQuery({
    type: Boolean,
    required: false,
    name: STREAM,
    default: "false",
    description: [
      "**Response mode**",
      "",
      "When enabled, the server streams partial results as they become available.",
      "When disabled, a single aggregated response is returned after processing completes.",
    ].join("\n"),
  });

export const ApiQueryRoomId = () =>
  ApiQuery({
    name: ROOM_ID,
    type: String,
    required: false,
    example: "a1b2c3",
    description: [
      "**Socket.IO routing key**",
      "",
      "Identifies the Socket.IO room used to emit asynchronous results.",
      "Allows responses to be routed to a specific client or group.",
    ].join("\n"),
  });

export const ApiQueryBatchId = () =>
  ApiQuery({
    name: BATCH_ID,
    type: String,
    required: false,
    example: "1234",
    description: [
      "**Batch correlation identifier**",
      "",
      "Client-defined identifier for grouping uploaded files.",
      "Used to associate multiple assets with a single logical request.",
    ].join("\n"),
  });

export const ApiQueryNumCtx = () =>
  ApiQuery({
    name: NUM_CTX,
    required: false,
    type: Number,
    example: "32000",
    description: [
      "**Model context size**",
      "",
      "Defines the maximum token context available to the model.",
      "Higher values increase memory usage and resource consumption.",
    ].join("\n"),
  });

const ApiBodySchema = () =>
  ApiBody({
    schema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          example: "describe",
          enum: ["describe", "compare", "ocr"] satisfies Array<VisionTask>,
          description: [
            "**Vision task**",
            "",
            "Determines the operation performed on the submitted images.",
            "Examples include description, comparison, and optical character recognition.",
          ].join("\n"),
        },
        prompt: {
          type: "object",
          required: ["role", "content"],
          example: [
            {
              role: "user",
              content: "Describe this image in exhaustive visual detail",
            },
          ],
          properties: {
            role: {
              type: "string",
              example: "user",
              enum: ["user", "tool", "assistant"],
              description: "**The prompt role**",
            },
            content: {
              type: "string",
              description: "**The prompt content**",
            },
          },
          description: [
            "**Prompt**",
            "",
            "Provides textual guidance to the model for performing the vision task.",
            "Can refine or constrain the output, for example by specifying level of detail or focus areas.",
          ].join("\n"),
        },
        images: {
          type: "array",
          description: [
            "**Image inputs**",
            "",
            "One or more image files submitted for analysis.",
            "Images must be provided as multipart form-data.",
          ].join("\n"),
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  });

const ApiHeaderXVisionLLM = () =>
  ApiHeader({
    name: X_VISION_LLM,
    required: true,
    schema: {
      type: "string",
      example: "ministral-3:14b",
    },
    description: [
      "**Vision model selector**",
      "",
      "Specifies the vision-capable LLM used to process the request.",
      "Supported models are configured and managed by the system administrator.",
    ].join("\n"),
  });

export const ApiVision = () =>
  applyDecorators(
    ApiHeaderXVisionLLM(),
    ApiConsumes("multipart/form-data"),
    ApiResponse({
      status: HttpStatus.ACCEPTED,
      description: [
        "**Asynchronous processing**",
        "",
        "The request has been accepted and queued for processing.",
        "Results are emitted asynchronously via Socket.IO.",
      ].join("\n"),
    }),
    ApiBodySchema(),
    ApiQueryRoomId(),
    ApiQueryBatchId(),
    ApiQueryStream(),
    ApiQueryNumCtx(),
  );
