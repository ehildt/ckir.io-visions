import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

import { VisionTask } from "../classic/get-fastify-multipart-data-req.dto";
import { Prompt } from "../prompt.dto";

import {
  McpGenericType,
  SupportedToolFunction,
  SupportedToolMethod,
} from "./mcp.model";

class JsonRpcVisionPayloadReq_Params_Arguments {
  constructor(obj?: JsonRpcVisionPayloadReq_Params_Arguments) {
    if (obj) Object.assign(this, obj);
  }

  @IsOptional()
  @IsArray()
  @Type(() => Prompt)
  @ValidateNested({ each: true })
  @ApiPropertyOptional({
    type: Prompt,
    isArray: true,
  })
  prompt?: Array<Prompt>;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    type: String,
    enum: ["describe", "compare", "ocr"] satisfies Array<VisionTask>,
    example: "describe" as VisionTask,
  })
  task?: VisionTask;
}

export class McpVisionPayloadReq_Params {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: "visions.analyze" satisfies SupportedToolFunction,
    enum: ["visions.analyze"] satisfies Array<SupportedToolFunction>,
  })
  function: SupportedToolFunction;

  @ApiProperty({
    type: JsonRpcVisionPayloadReq_Params_Arguments,
    description: "Tool arguments as defined by the tool inputSchema",
  })
  @IsObject()
  @Type(() => JsonRpcVisionPayloadReq_Params_Arguments)
  @ValidateNested()
  arguments: JsonRpcVisionPayloadReq_Params_Arguments;
}

export class McpVisionPayloadReq implements McpGenericType {
  @ApiProperty({ example: 2 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: "2.0" })
  @IsIn(["2.0"])
  jsonrpc: "2.0";

  @ApiProperty({ example: "tools/call" satisfies SupportedToolMethod })
  @IsString()
  method: SupportedToolMethod;

  @ApiProperty({ type: McpVisionPayloadReq_Params })
  @ValidateNested()
  @Type(() => McpVisionPayloadReq_Params)
  params: McpVisionPayloadReq_Params;
}
