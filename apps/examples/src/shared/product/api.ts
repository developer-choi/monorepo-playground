import {api} from '@/shared/api/client';
import type {Product, PaginatedResponse} from '@/shared/product/type';

interface GetProductsParams {
  page?: number;
  limit?: number;
}

export function getProductsApi(params?: GetProductsParams) {
  return api.get('api/product', {searchParams: {...params}}).json<PaginatedResponse<Product>>();
}
