import { Global, Module } from "@nestjs/common";

import { AnalyzeImageService } from "../services/analyze-image.service.js";
import { JobTrackingService } from "../services/job-tracking.service.js";
import { SocketService } from "../services/socket.service.js";

@Global()
@Module({
  providers: [JobTrackingService, SocketService, AnalyzeImageService],
  exports: [JobTrackingService, SocketService],
})
export class SocketEventModule {}
