import { Context, Effect, Option } from "effect"
import { AppError } from "./app-error.js"
import { User, UserId } from "../entity/user.js"

export interface IUserRepository {
  readonly create: (user: User) => Effect.Effect<User, AppError, never>
  readonly findById: (id: UserId) => Effect.Effect<Option.Option<User>, AppError, never>
  readonly findByEmail: (email: typeof User.Type.email) => Effect.Effect<Option.Option<User>, AppError, never>
}

export class UserRepository extends Context.Tag("UserRepository")<UserRepository, IUserRepository>() {}
