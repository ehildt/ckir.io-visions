import { createHash } from "node:crypto";

import { readPackageJsonFromRoot } from "@ehildt/ckir-helpers/bootstrap";
import type { MultipartFile } from "@fastify/multipart";
import { BadRequestException, Injectable } from "@nestjs/common";

import { SocketIOConfigService } from "../configs/socket-io-config.service.js";
import { JSON_RPC_TOOLS_LIST } from "../constants/json-rpc.constants.js";
import {
  MCP_CAPABILITIES,
  MCP_PROTOCOL_VERSION,
} from "../constants/mcp.constants.js";
import {
  FastifyMultipartDataWithFiltersReq,
  FastifyMultipartMeta,
} from "../dtos/classic/get-fastify-multipart-data-req.dto.js";
import {
  McpGenericType,
  SupportedToolFunction,
} from "../dtos/json-rpc/mcp.model.js";

import { AnalyzeImageService } from "./analyze-image.service.js";
@Injectable()
export class JsonRpcService {
  constructor(
    private readonly analyzeImageService: AnalyzeImageService,
    private readonly socketIOConfigService: SocketIOConfigService,
  ) {}

  async initialize() {
    const packageJson = readPackageJsonFromRoot() as {
      name: string;
      version: string;
    };

    return {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: MCP_CAPABILITIES,
      serverInfo: { name: packageJson.name, version: packageJson.version },
    };
  }

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

    const tools = JSON_RPC_TOOLS_LIST.result.tools.filter(({ name }) =>
      rTools.includes(name),
    );

    return {
      ...JSON_RPC_TOOLS_LIST,
      result: {
        tools,
      },
    };
  }

  async toFilePayloads(requestId: string, images: Array<MultipartFile>) {
    return await Promise.all(
      images.map(async (file) => {
        const buffer = await file.toBuffer();
        const hash = createHash("sha256").update(buffer).digest("hex");
        const meta: FastifyMultipartMeta = {
          name: file.filename,
          type: file.mimetype,
          hash: `${hash}_${requestId}`,
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

    const event = req.filters.event;

    return {
      content: [
        {
          type: "text",
          text: "Processing started. Connect to Socket.IO for real-time results.",
        },
      ],
      isError: false,
      realtime: {
        event,
        roomId: req.filters.roomId,
        requestId: req.filters.requestId,
      },
    };
  }
}
