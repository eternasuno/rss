import { Data } from "effect"

export type ErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "FEED_GENERATION_ERROR"

export class AppError extends Data.TaggedError("AppError")<{
  readonly code: ErrorCode
  readonly message: string
}> {}
