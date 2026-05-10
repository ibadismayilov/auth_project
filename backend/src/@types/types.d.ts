import { Request, Response, NextFunction } from 'express';

declare global {
  type MiddlewareFunction = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => void | Promise<void>;
}

export {};