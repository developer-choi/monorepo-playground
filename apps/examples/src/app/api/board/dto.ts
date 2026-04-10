/* eslint-disable @typescript-eslint/naming-convention */
export interface ServerBoardDto {
  id: number;
  post_title: string;
  post_content: string;
  board_type: string;
  category: string;
  tag_list: string[] | null;
  author: string;
  thumbnail_url: string;
  created_at: string;
}

export interface ServerBoardRowDto {
  id: number;
  post_title: string;
  board_type: string;
  category: string;
  tag_list: string[] | null;
  author: string;
  thumbnail_url: string;
  created_at: string;
}

export interface ServerPaginationMetaDto {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ServerBoardListResponseDto {
  list: ServerBoardRowDto[];
  pagination_meta: ServerPaginationMetaDto;
}
