import { Readable } from "node:stream";

import { MultipartFile } from "@fastify/multipart";
import { Test, TestingModule } from "@nestjs/testing";

import { JsonRpcService } from "../services/json-rpc.service";

import { JsonRpcController } from "./json-rpc.controller";

vi.mock("@ehildt/ckir-helpers/hash-payload", () => ({
  hashPayload: vi.fn(() => "hash123"),
}));

describe("JsonRpcController", () => {
  let controller: JsonRpcController;
  let jsonRpcService: JsonRpcService;

  const mockFileStream = () =>
    Object.assign(new Readable({ read() {} }), {
      truncated: false,
      bytesRead: 0,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JsonRpcController],
      providers: [
        {
          provide: JsonRpcService,
          useValue: {
            getRequestedTools: vi.fn().mockResolvedValue({
              jsonrpc: "2.0",
              id: 1,
              result: { tools: [] },
            }),
            toFilePayloads: vi
              .fn()
              .mockImplementation(
                async (_batchId: string, files: unknown[]) => {
                  if (!files || files.length === 0) return [];
                  return [
                    {
                      buffer: Buffer.from("image-bytes"),
                      meta: {
                        name: "photo.jpg",
                        type: "image/jpeg",
                        hash: "hash123",
                      },
                    },
                  ];
                },
              ),
            analyze: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JsonRpcController>(JsonRpcController);
    jsonRpcService = module.get<JsonRpcService>(JsonRpcService);
  });

  describe("rpc", () => {
    it("throws BadRequestException when x-vision-llm header is missing", async () => {
      const batchId = "batch-1";
      const stream = false;
      const req = { method: "tools/call" } as any;

      await expect(
        controller.rpc(
          batchId,
          stream,
          undefined as any,
          req,
          undefined,
          undefined,
          undefined,
        ),
      ).rejects.toThrow("Missing x-vision-llm header");
    });

    it("throws BadRequestException when images are missing for tools/call", async () => {
      const batchId = "batch-1";
      const stream = false;
      const vLLM = "llama3.2-vision";
      const req = {
        method: "tools/call",
        params: { name: "visions.analyze", arguments: { task: "describe" } },
      } as any;

      await expect(
        controller.rpc(
          batchId,
          stream,
          vLLM,
          req,
          undefined,
          undefined,
          undefined,
        ),
      ).rejects.toThrow("Missing images");
    });

    it("returns tools list for tools/list method", async () => {
      const batchId = "batch-1";
      const stream = false;
      const vLLM = "llama3.2-vision";
      const req = { method: "tools/list" } as any;

      const result = await controller.rpc(
        batchId,
        stream,
        vLLM,
        req,
        undefined,
        undefined,
        undefined,
      );

      expect(jsonRpcService.getRequestedTools).toHaveBeenCalledWith(req);
      expect(result).toEqual({
        jsonrpc: "2.0",
        id: 1,
        result: { tools: [] },
      });
    });

    it("calls analyze for visions.analyze with images", async () => {
      const batchId = "batch-1";
      const stream = true;
      const vLLM = "llama3.2-vision";
      const roomId = "room-1";
      const numCtx = 4096;
      const req = {
        method: "tools/call",
        params: {
          name: "visions.analyze",
          arguments: {
            task: "describe",
            prompt: [{ role: "user", content: "test" }],
          },
        },
      } as any;
      const images = [
        {
          type: "file",
          fieldname: "image",
          filename: "photo.jpg",
          encoding: "7bit",
          mimetype: "image/jpeg",
          fields: {},
          file: mockFileStream(),
          toBuffer: vi.fn().mockResolvedValue(Buffer.from("image-bytes")),
        },
      ] as any;

      await controller.rpc(batchId, stream, vLLM, req, roomId, numCtx, images);

      expect(jsonRpcService.toFilePayloads).toHaveBeenCalledWith(
        batchId,
        images,
      );
      expect(jsonRpcService.analyze).toHaveBeenCalledWith({
        buffers: [Buffer.from("image-bytes")],
        meta: [{ name: "photo.jpg", type: "image/jpeg", hash: "hash123" }],
        filters: {
          vLLM,
          batchId,
          roomId,
          stream,
          numCtx,
          prompt: [{ role: "user", content: "test" }],
          task: "describe",
        },
      });
    });

    it("throws BadRequestException when images array is empty for tools/call", async () => {
      const batchId = "batch-1";
      const stream = false;
      const vLLM = "llama3.2-vision";
      const req = {
        method: "tools/call",
        params: {
          name: "visions.analyze",
          arguments: { task: "ocr" },
        },
      } as any;
      const images: Array<MultipartFile> = [] as any;

      await expect(
        controller.rpc(
          batchId,
          stream,
          vLLM,
          req,
          undefined,
          undefined,
          images,
        ),
      ).rejects.toThrow("Missing images");
    });
  });
});
