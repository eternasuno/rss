import { Context, Effect, Option } from "effect"
import { AppError } from "./app-error.js"
import { ApiKey, ApiKeyId } from "../entity/api-key.js"
import { UserId } from "../entity/user.js"

export interface IApiKeyRepository {
  readonly create: (apiKey: ApiKey) => Effect.Effect<ApiKey, AppError, never>
  readonly findByKey: (key: string) => Effect.Effect<Option.Option<ApiKey>, AppError, never>
  readonly findByUserId: (userId: UserId) => Effect.Effect<ReadonlyArray<ApiKey>, AppError, never>
  readonly updateLastUsedAt: (id: ApiKeyId) => Effect.Effect<void, AppError, never>
  readonly delete: (id: ApiKeyId) => Effect.Effect<void, AppError, never>
}

export class ApiKeyRepository extends Context.Tag("ApiKeyRepository")<ApiKeyRepository, IApiKeyRepository>() {}
