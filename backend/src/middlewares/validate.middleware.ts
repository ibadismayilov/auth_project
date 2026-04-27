import { Request, Response, NextFunction } from "express";
import { z } from "zod/v3";

type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void> | any;

const validateInput = (schema: z.AnyZodObject): MiddlewareFunction => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: result.error.errors.map((err: any) => ({
          path: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
    }

    next();
  };
};

export default validateInput;
