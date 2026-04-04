import { Prompt } from "../prompt.dto.js";

export type FastifyMultipartMeta = {
  name: string;
  type: string;
  hash: string;
};

export type VisionTask = "describe" | "compare" | "ocr";

type FastifyMultipartFilter = {
  roomId: string;
  stream: boolean;
  prompt: Array<Prompt>;
  requestId: string;
  vLLM: string;
  task: VisionTask;
  numCtx: number;
  event: string;
};

export type FastifyMultipartDataWithFiltersReq = {
  buffers: Array<Buffer>;
  meta: Array<FastifyMultipartMeta>;
  filters: Partial<FastifyMultipartFilter>;
};
