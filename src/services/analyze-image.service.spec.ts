import { Readable } from "node:stream";

import { hashPayload } from "@ehildt/ckir-helpers/hash-payload";
import { MultipartFile } from "@fastify/multipart";
import { getQueueToken } from "@nestjs/bullmq";
import { Test, TestingModule } from "@nestjs/testing";
import { Queue } from "bullmq";

import { BULLMQ_JOB, BULLMQ_QUEUE } from "../constants/bullmq.constants";

import { AnalyzeImageService } from "./analyze-image.service";

vi.mock("@ehildt/ckir-helpers/hash-payload", () => ({
  hashPayload: vi.fn(),
}));

describe("AnalyzeImageService", () => {
  let service: AnalyzeImageService;
  let describeQueue: vi.Mocked<Queue>;
  let compareQueue: vi.Mocked<Queue>;
  let ocrQueue: vi.Mocked<Queue>;

  const mockFileStream = () =>
    Object.assign(new Readable({ read() {} }), {
      truncated: false,
      bytesRead: 0,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyzeImageService,
        {
          provide: getQueueToken(BULLMQ_QUEUE.IMAGE_DESCRIBE),
          useValue: { add: vi.fn() },
        },
        {
          provide: getQueueToken(BULLMQ_QUEUE.IMAGE_COMPARE),
          useValue: { add: vi.fn() },
        },
        {
          provide: getQueueToken(BULLMQ_QUEUE.IMAGE_OCR),
          useValue: { add: vi.fn() },
        },
      ],
    }).compile();

    service = module.get(AnalyzeImageService);
    describeQueue = module.get(getQueueToken(BULLMQ_QUEUE.IMAGE_DESCRIBE));
    compareQueue = module.get(getQueueToken(BULLMQ_QUEUE.IMAGE_COMPARE));
    ocrQueue = module.get(getQueueToken(BULLMQ_QUEUE.IMAGE_OCR));
  });

  describe("toFilePayloads", () => {
    it("maps MultipartFile to buffer + meta payload", async () => {
      const buffer = Buffer.from("image-bytes");
      (hashPayload as vi.Mock).mockReturnValue("hash123");

      const file: MultipartFile = {
        type: "file",
        fieldname: "image",
        filename: "photo.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        fields: {},
        file: mockFileStream(),
        toBuffer: vi.fn().mockResolvedValue(buffer),
      };

      const result = await service.toFilePayloads("batch-1", [file]);

      expect(file.toBuffer).toHaveBeenCalledTimes(1);
      expect(hashPayload).toHaveBeenCalledWith(buffer, "sha256");
      expect(result).toEqual([
        {
          buffer,
          meta: {
            name: "photo.jpg",
            type: "image/jpeg",
            hash: "hash123_batch-1",
          },
        },
      ]);
    });
  });

  describe("emit", () => {
    it("enqueues describe job", async () => {
      const req = { filters: { task: "describe" } } as any;

      await service.emit(req);

      expect(describeQueue.add).toHaveBeenCalledWith(
        BULLMQ_JOB.DESCRIBE_IMAGE,
        req,
      );
    });

    it("enqueues compare job", async () => {
      const req = { filters: { task: "compare" } } as any;

      await service.emit(req);

      expect(compareQueue.add).toHaveBeenCalledWith(
        BULLMQ_JOB.COMPARE_IMAGES,
        req,
      );
    });

    it("enqueues ocr job", async () => {
      const req = { filters: { task: "ocr" } } as any;

      await service.emit(req);

      expect(ocrQueue.add).toHaveBeenCalledWith(BULLMQ_JOB.OCR_IMAGE, req);
    });

    it("does nothing for unknown task", async () => {
      const req = { filters: { task: "unknown" } } as any;

      await service.emit(req);

      expect(describeQueue.add).not.toHaveBeenCalled();
      expect(compareQueue.add).not.toHaveBeenCalled();
      expect(ocrQueue.add).not.toHaveBeenCalled();
    });
  });
});
