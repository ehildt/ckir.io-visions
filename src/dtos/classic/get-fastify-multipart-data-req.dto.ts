import { Prompt } from "../prompt.dto";

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
  batchId: string;
  vLLM: string;
  task: VisionTask;
  numCtx: number;
};

export type FastifyMultipartDataWithFiltersReq = {
  buffers: Array<Buffer>;
  meta: Array<FastifyMultipartMeta>;
  filters: Partial<FastifyMultipartFilter>;
};
