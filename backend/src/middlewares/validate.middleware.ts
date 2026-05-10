import { Request, Response, NextFunction } from "express";
import { z, ZodIssue } from "zod";

const validateInput = (schema: z.AnyZodObject): MiddlewareFunction => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {

      res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: result.error.issues.map((err: ZodIssue) => ({
          path: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
      return; 
    }

    next();
  };
};

export default validateInput;