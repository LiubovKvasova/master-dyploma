import { PipeTransform, BadRequestException } from '@nestjs/common';

export class ParseJsonPipe implements PipeTransform {
  transform(value: any, metadata: any) {
    try {
      return JSON.parse(value);
    } catch {
      throw new BadRequestException('Invalid JSON in "data"');
    }
  }
}
