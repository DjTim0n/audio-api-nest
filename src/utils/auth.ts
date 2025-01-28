import { Request } from 'express';

interface ExtractTokenResult {
  token: string | undefined;
}

export function extractToken(request: Request): ExtractTokenResult {
  const authHeader = request.headers.authorization;
  let token: string | undefined = undefined;

  if (authHeader) {
    const [type, tokenFromBearer] = authHeader.split(' ');
    if (type === 'Bearer') {
      token = tokenFromBearer;
    }
  }

  return { token };
}
