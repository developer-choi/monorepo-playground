import {z} from 'zod';

export function safeParsePartial<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  data: Record<string, unknown>,
): Partial<z.infer<T>> {
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(schema.shape)) {
    const fieldSchema = schema.shape[key];

    if (!fieldSchema) {
      continue;
    }

    const fieldResult = z.safeParse(fieldSchema, data[key]);

    if (fieldResult.success && fieldResult.data !== undefined) {
      result[key] = fieldResult.data;
    }
  }

  return result as Partial<z.infer<T>>;
}
