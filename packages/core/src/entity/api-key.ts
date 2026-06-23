import { Schema } from "effect"

export class ApiKey extends Schema.Class<ApiKey>("ApiKey")({
  id: Schema.UUID,
  key: Schema.String,
  userId: Schema.UUID,
  expiresAt: Schema.OptionFromNullOr(Schema.Date),
  lastUsedAt: Schema.OptionFromNullOr(Schema.Date),
  createdAt: Schema.Date,
}) {}
