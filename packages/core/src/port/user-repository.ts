import { Context, type Effect, type Option } from 'effect';
import type { User, UserId } from '../entity/user.js';
import type { AppError } from './app-error.js';

export interface IUserRepository {
  readonly create: (user: User) => Effect.Effect<User, AppError, never>;
  readonly findById: (id: UserId) => Effect.Effect<Option.Option<User>, AppError, never>;
  readonly findByEmail: (
    email: typeof User.Type.email
  ) => Effect.Effect<Option.Option<User>, AppError, never>;
}

export class UserRepository extends Context.Tag('UserRepository')<
  UserRepository,
  IUserRepository
>() {}
