import {api} from '@/shared/api/client';
import type {ServerBoardListResponseDto} from '@/app/api/board/dto';
import type {Board} from './types';

export interface GetBoardListApiResponse {
  list: Board[];
  hasNext: boolean;
}

export interface GetBoardListApiRequest {
  page: number;
  limit?: number;
}

function toBoard(row: ServerBoardListResponseDto['list'][number]): Board {
  return {
    id: row.id,
    postTitle: row.post_title,
    author: row.author,
    thumbnailUrl: row.thumbnail_url,
    createdAt: row.created_at,
  };
}

export async function getBoardListApi(request: GetBoardListApiRequest): Promise<GetBoardListApiResponse> {
  const {page, limit = 24} = request;
  const raw = await api.get('api/board', {searchParams: {page, limit}}).json<ServerBoardListResponseDto>();
  const totalPages = raw.pagination_meta.total_pages;
  return {
    list: raw.list.map(toBoard),
    hasNext: raw.pagination_meta.page < totalPages,
  };
}
