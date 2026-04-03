import { Readable } from "node:stream";

import { MultipartFile } from "@fastify/multipart";
import { Test, TestingModule } from "@nestjs/testing";

import { AnalyzeImageService } from "../services/analyze-image.service";

import { ClassicController } from "./classic.controller";

vi.mock("@ehildt/ckir-helpers/hash-payload", () => ({
  hashPayload: vi.fn(() => "hash123"),
}));

describe("ClassicController", () => {
  let controller: ClassicController;
  let analyzeImageService: AnalyzeImageService;

  const mockFileStream = () =>
    Object.assign(new Readable({ read() {} }), {
      truncated: false,
      bytesRead: 0,
    });

  beforeEach(async () => {
    const toFilePayloadsMock = vi
      .fn()
      .mockImplementation(async (_batchId: string, files: unknown[]) => {
        if (!files || files.length === 0) return [];
        return [
          {
            buffer: Buffer.from("image-bytes"),
            meta: { name: "photo.jpg", type: "image/jpeg", hash: "hash123" },
          },
        ];
      });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassicController],
      providers: [
        {
          provide: AnalyzeImageService,
          useValue: {
            toFilePayloads: toFilePayloadsMock,
            emit: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ClassicController>(ClassicController);
    analyzeImageService = module.get<AnalyzeImageService>(AnalyzeImageService);
  });

  describe("visionStream", () => {
    it("throws BadRequestException when x-vision-llm header is missing", async () => {
      const batchId = "batch-1";
      const stream = false;
      const task = { value: "describe" } as any;
      const images: Array<MultipartFile> = [] as any;

      await expect(
        controller.visionStream(
          batchId,
          undefined as any,
          stream,
          task,
          undefined,
          undefined,
          images,
        ),
      ).rejects.toThrow("Missing x-vision-llm header");
    });

    it("calls analyzeImageService with correct parameters", async () => {
      const batchId = "batch-1";
      const vLLM = "llama3.2-vision";
      const stream = false;
      const task = { value: "describe" } as any;
      const roomId = "room-1";
      const numCtx = 4096;
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

      await controller.visionStream(
        batchId,
        vLLM,
        stream,
        task,
        roomId,
        undefined,
        numCtx,
        images,
      );

      expect(analyzeImageService.toFilePayloads).toHaveBeenCalledWith(
        batchId,
        images,
      );
      expect(analyzeImageService.emit).toHaveBeenCalledWith({
        buffers: [Buffer.from("image-bytes")],
        meta: [{ name: "photo.jpg", type: "image/jpeg", hash: "hash123" }],
        filters: {
          vLLM,
          batchId,
          roomId,
          stream,
          numCtx,
          prompt: undefined,
          task: "describe",
        },
      });
    });

    it("processes images and calls analyzeImageService.emit", async () => {
      const batchId = "batch-1";
      const vLLM = "llama3.2-vision";
      const stream = true;
      const task = { value: "compare" } as any;
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

      await controller.visionStream(
        batchId,
        vLLM,
        stream,
        task,
        undefined,
        undefined,
        undefined,
        images,
      );

      expect(analyzeImageService.toFilePayloads).toHaveBeenCalledWith(
        batchId,
        images,
      );
      expect(analyzeImageService.emit).toHaveBeenCalledWith({
        buffers: [Buffer.from("image-bytes")],
        meta: [{ name: "photo.jpg", type: "image/jpeg", hash: "hash123" }],
        filters: {
          vLLM,
          batchId,
          roomId: undefined,
          stream: true,
          numCtx: undefined,
          prompt: undefined,
          task: "compare",
        },
      });
    });

    it("handles empty images array", async () => {
      const batchId = "batch-1";
      const vLLM = "llama3.2-vision";
      const stream = false;
      const task = { value: "ocr" } as any;

      await controller.visionStream(
        batchId,
        vLLM,
        stream,
        task,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      expect(analyzeImageService.toFilePayloads).toHaveBeenCalledWith(
        batchId,
        [],
      );
      expect(analyzeImageService.emit).toHaveBeenCalledWith({
        buffers: [],
        meta: [],
        filters: {
          vLLM,
          batchId,
          roomId: undefined,
          stream: false,
          numCtx: undefined,
          prompt: undefined,
          task: "ocr",
        },
      });
    });
  });
});
