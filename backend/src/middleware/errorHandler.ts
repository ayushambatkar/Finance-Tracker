import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "../lib/httpError.js";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2025"
  ) {
    res.status(404).json({
      error: "Expense not found.",
    });
    return;
  }

  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2003"
  ) {
    res.status(400).json({
      error: "Invalid related resource reference.",
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      error: err.message,
    });
    return;
  }

  res.status(500).json({
    error: "Unexpected server error.",
  });
};
