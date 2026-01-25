import { SupportedToolFunction } from "@/dtos/json-rpc/mcp.model";

export const VISIONS_ANALYZE = {
  name: "visions.analyze" satisfies SupportedToolFunction,
  description: [
    "Perform a specific visual analysis on provided images based on the selected task:",
    "description, comparison, or optical character recognition (OCR).",
  ].join(" "),
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["images", "prompt", "task"],
    properties: {
      prompt: {
        type: "string",
        description: [
          "Optional textual instruction to guide the selected vision task.",
          "For example, provide context or specify what to focus on during analysis.",
        ].join(" "),
      },
      task: {
        type: "string",
        default: "describe",
        description: [
          "Specifies which type of analysis to perform.",
          "Only one task is executed per request:",
          '"describe": generates a description of the image content.',
          '"compare": evaluates similarities or differences between images.',
          '"ocr": extracts text content from the images.',
        ].join(" "),
        enum: ["describe", "compare", "ocr"],
      },
    },
  },
} as const;
