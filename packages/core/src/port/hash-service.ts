import { Context, Effect } from "effect"
import { AppError } from "./app-error.js"

export interface IHashService {
  readonly hash: (plaintext: string) => Effect.Effect<string, AppError, never>
}

export class HashService extends Context.Tag("HashService")<HashService, IHashService>() {}
