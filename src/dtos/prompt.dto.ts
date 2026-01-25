import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class Prompt {
  @ApiProperty({ example: "user" })
  @IsString()
  role: string;

  @ApiProperty({ example: "I love cookies" })
  @IsString()
  content: string;
}
