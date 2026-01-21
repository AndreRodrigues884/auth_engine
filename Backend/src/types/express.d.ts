import { TokenPayload } from './auth.ts';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};