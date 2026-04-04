import { Readable } from "node:stream";

import { hashPayload } from "@ehildt/ckir-helpers/hash-payload";
import { MultipartFile } from "@fastify/multipart";
import { getQueueToken } from "@nestjs/bullmq";
import { Test, TestingModule } from "@nestjs/testing";
import { Queue } from "bullmq";
import { Mock, vi } from "vitest";

import { BULLMQ_JOB, BULLMQ_QUEUE } from "../constants/bullmq.constants.js";

import { AnalyzeImageService } from "./analyze-image.service.js";

vi.mock("@ehildt/ckir-helpers/hash-payload", () => ({
  hashPayload: vi.fn(),
}));

describe("AnalyzeImageService", () => {
  let service: AnalyzeImageService;
  let describeQueue: Queue & { add: Mock };
  let compareQueue: Queue & { add: Mock };
  let ocrQueue: Queue & { add: Mock };

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
      (
        hashPayload as unknown as { mockReturnValue: (value: string) => void }
      ).mockReturnValue("hash123");

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

    it("handles multiple image files", async () => {
      const buffer1 = Buffer.from("image-bytes-1");
      const buffer2 = Buffer.from("image-bytes-2");
      const hashMock = hashPayload as ReturnType<typeof vi.fn>;
      hashMock.mockReturnValueOnce("hash1").mockReturnValueOnce("hash2");

      const file1: MultipartFile = {
        type: "file",
        fieldname: "image",
        filename: "photo1.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        fields: {},
        file: mockFileStream(),
        toBuffer: vi.fn().mockResolvedValue(buffer1),
      };

      const file2: MultipartFile = {
        type: "file",
        fieldname: "image",
        filename: "photo2.png",
        encoding: "7bit",
        mimetype: "image/png",
        fields: {},
        file: mockFileStream(),
        toBuffer: vi.fn().mockResolvedValue(buffer2),
      };

      const result = await service.toFilePayloads("req-456", [file1, file2]);

      expect(result).toHaveLength(2);
      expect(result[0].meta).toEqual({
        name: "photo1.jpg",
        type: "image/jpeg",
        hash: "hash1_req-456",
      });
      expect(result[1].meta).toEqual({
        name: "photo2.png",
        type: "image/png",
        hash: "hash2_req-456",
      });
    });

    it("handles empty image array", async () => {
      const result = await service.toFilePayloads("batch-1", []);

      expect(result).toEqual([]);
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
