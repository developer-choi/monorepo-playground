import {z} from 'zod';

export function safeParsePartial<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  data: Record<string, unknown>,
): Partial<z.infer<T>> {
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(schema.shape)) {
    const value = data[key];

    if (value === undefined) {
      continue
    }

    const fieldResult = z.safeParse(schema.shape[key], value);

    if (fieldResult.success) {
      result[key] = fieldResult.data;
    }
  }

  return result as Partial<z.infer<T>>;
}
