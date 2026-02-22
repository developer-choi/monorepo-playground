import {type NextRequest, NextResponse} from 'next/server';
import database from '@/shared/server/database';
import type {Product, PaginatedResponse} from '@/shared/product/type';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 24;

export async function GET(request: NextRequest) {
  const {searchParams} = request.nextUrl;
  const page = Number(searchParams.get('page')) || DEFAULT_PAGE;
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;

  const products = await database.product.get();
  const start = (page - 1) * limit;
  const items: Product[] = products.slice(start, start + limit);
  const totalCount = products.length;
  const hasNext = start + limit < totalCount;

  const response: PaginatedResponse<Product> = {items, totalCount, hasNext};

  return NextResponse.json(response);
}
