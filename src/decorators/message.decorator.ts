import { SetMetadata } from '@nestjs/common';

export const MESSAGE_KEY = 'customMessage';
export const SetMessage = (message: string) =>
  SetMetadata(MESSAGE_KEY, message);
