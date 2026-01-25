import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

import { SupportedToolFunction, SupportedToolMethod } from "./mcp.model";

class McpToolsListReq_Params {
  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
    isArray: true,
    example: ["visions.analyze"] satisfies SupportedToolFunction[],
    description: "A list of requested tools by their names",
  })
  requestedTools?: Array<SupportedToolFunction>;
}

export class McpToolsListReq {
  @ApiProperty({ example: 2 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: "2.0" })
  @IsIn(["2.0"])
  jsonrpc: "2.0";

  @ApiProperty({ example: "tools/list" satisfies SupportedToolMethod })
  @IsString()
  method: SupportedToolMethod;

  @ApiProperty({ type: McpToolsListReq_Params })
  @ValidateNested()
  @Type(() => McpToolsListReq_Params)
  params: McpToolsListReq_Params;
}
