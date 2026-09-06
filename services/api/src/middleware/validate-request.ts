import type { RequestHandler, Response } from "express";
import { ZodError, type ZodType } from "zod";

import { HttpError } from "../lib/http-error";

type RequestSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export const validateRequest =
  ({ body, params, query }: RequestSchemas): RequestHandler =>
  (req, res, next) => {
    try {
      if (body) {
        req.body = body.parse(req.body);
      }

      if (params) {
        req.params = params.parse(req.params) as typeof req.params;
      }

      if (query) {
        res.locals.validatedQuery = query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new HttpError(400, "Invalid request input.", {
            code: "validation_error",
            details: error.flatten(),
          }),
        );
        return;
      }

      next(error);
    }
  };

export const getValidatedQuery = <T>(res: Response) => res.locals.validatedQuery as T;
