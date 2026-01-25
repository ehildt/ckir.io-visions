import { MultipartValue } from "@fastify/multipart";
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from "@nestjs/common";

@Injectable()
export class MultipartFieldPipe
  implements PipeTransform<unknown, MultipartValue>
{
  transform(v: MultipartValue, metadata: ArgumentMetadata) {
    if (v == null)
      throw new BadRequestException(`Invalid multipart field ${metadata.data}`);
    return v;
  }
}
