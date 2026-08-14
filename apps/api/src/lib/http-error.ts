export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function assertDatabaseResult(error: { message: string; code?: string } | null) {
  if (!error) return;
  if (error.code === '23505') throw new HttpError(409, 'CONFLICT', 'Ya existe un registro con esos datos.');
  if (error.code === '23514') throw new HttpError(400, 'CONSTRAINT_ERROR', error.message);
  throw new HttpError(500, 'DATABASE_ERROR', 'No fue posible completar la operación.');
}
