// ── User ──
export type User = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

// ── API Key ──
export type ApiKey = {
  id: string;
  userId: string;
  key: string;
  expiresAt: string | null;
  createdAt: string;
};

// ── Feed ──
export type Feed = {
  id: string;
  userId: string;
  title: string;
  description: string;
  link: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

// ── Item ──
export type Item = {
  id: string;
  feedId: string;
  title: string;
  data: Record<string, unknown>;
  createdAt: string;
};

// ── API I/O ──
export type CreateItemBody = {
  title: string;
  data?: Record<string, unknown>;
};

export type CreateFeedInput = {
  title: string;
  description: string;
  link: string;
  data?: Record<string, unknown>;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
