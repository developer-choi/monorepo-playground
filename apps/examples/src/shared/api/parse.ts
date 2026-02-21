import {ZodError} from 'zod';
import ApiResponseValidationError from '@/shared/error/class/ApiResponseValidationError';

/**
 * @throws {ApiResponseValidationError}
 */
export function validateApiResponse<T>(schema: {parse: (data: unknown) => T}, response: unknown): T {
  try {
    return schema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiResponseValidationError(response, error);
    }
    throw error;
  }
}
