export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface BaseOptions {
  headers?: HeadersInit;
  searchParams?: object;
}

export interface BodyOption {
  body: unknown;
}

export default abstract class ApiClient {
  protected readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  abstract get<T>(url: string, options?: BaseOptions): Promise<T>;
  abstract post<T>(url: string, options: BaseOptions & BodyOption): Promise<T>;
  abstract put<T>(url: string, options: BaseOptions & BodyOption): Promise<T>;
  abstract patch<T>(url: string, options: BaseOptions & BodyOption): Promise<T>;
  abstract delete<T>(url: string, options?: BaseOptions): Promise<T>;
}
