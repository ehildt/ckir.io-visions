import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class Prompt {
  @ApiProperty({ example: "user" })
  @IsString()
  role: string;

  @ApiProperty({ example: "Describe this image in exhaustive visual detail." })
  @IsString()
  content: string;
}
