export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }

  static notFound(message = 'Not Found') {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static validation(details: unknown) {
    return new AppError(422, 'VALIDATION', 'Validation failed', details);
  }
}
