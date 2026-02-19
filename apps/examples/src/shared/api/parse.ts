import {ZodError} from 'zod';

export function validateApiResponse<T>(schema: {parse: (data: unknown) => T}, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

export class ValidationError extends Error {
  constructor(public readonly zodError: ZodError) {
    super(zodError.message);
    this.name = 'ValidationError';
  }
}
