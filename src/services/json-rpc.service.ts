import { hashPayload } from "@ehildt/ckir-helpers";
import type { MultipartFile } from "@fastify/multipart";
import { BadRequestException, Injectable } from "@nestjs/common";

import { AnalyzeImageService } from "./analyze-image.service";

import {
  FastifyMultipartDataWithFiltersReq,
  FastifyMultipartMeta,
} from "@/dtos/classic/get-fastify-multipart-data-req.dto";
import {
  McpGenericType,
  SupportedToolFunction,
} from "@/dtos/json-rpc/mcp.model";
import { JSON_RPC_TOOLS_LIST } from "@/tools/tools.constants";
@Injectable()
export class JsonRpcService {
  constructor(private readonly analyzeImageService: AnalyzeImageService) {}
  async getRequestedTools(req: McpGenericType) {
    const rTools: Array<SupportedToolFunction> = req.params?.requestedTools;
    if (!rTools?.length) return JSON_RPC_TOOLS_LIST;

    const available = new Set(
      JSON_RPC_TOOLS_LIST.result.tools.map((t) => t.name),
    );

    rTools.forEach((rt) => {
      if (!available.has(rt))
        throw new BadRequestException(`No such tool available ${rt}`);
    });

    return {
      ...JSON_RPC_TOOLS_LIST,
      result: {
        tools: JSON_RPC_TOOLS_LIST.result.tools.filter(({ name }) =>
          rTools.includes(name),
        ),
      },
    };
  }

  async toFilePayloads(batchId: string, images: Array<MultipartFile>) {
    return await Promise.all(
      images.map(async (file) => {
        const buffer = await file.toBuffer();
        const meta: FastifyMultipartMeta = {
          name: file.filename,
          type: file.mimetype,
          hash: `${hashPayload(buffer, "sha256")}_${batchId}`,
        };
        return { buffer, meta };
      }),
    );
  }

  async analyze(req: FastifyMultipartDataWithFiltersReq) {
    void this.analyzeImageService.emit({
      buffers: req.buffers,
      meta: req.meta,
      filters: req.filters,
    });
  }
}
