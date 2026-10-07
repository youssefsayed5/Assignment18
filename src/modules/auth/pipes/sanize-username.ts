import { PipeTransform, Injectable, ArgumentMetadata, BadGatewayException } from '@nestjs/common';

@Injectable()
export class username implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if(!value || value !=="string")
{
    throw new BadGatewayException("not found")
}
    return value.trim().toLowerCase();
  }
}
