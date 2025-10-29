// 게시판 관련 타입 정의

export type BoardCategory = 'NOTICE' | 'FREE' | 'QNA' | 'ETC';

export interface BoardCategoriesResponse {
  NOTICE: string;
  FREE: string;
  QNA: string;
  ETC: string;
}

export interface Board {
  id: number;
  title: string;
  content: string;
  boardCategory: BoardCategory;
  imageUrl?: string;
  createdAt: string;
}

export interface BoardListItem {
  id: number;
  title: string;
  category: BoardCategory;
  createdAt: string;
}

export interface BoardCreateRequest {
  title: string;
  content: string;
  category: BoardCategory;
}

export interface BoardUpdateRequest {
  title: string;
  content: string;
  category: BoardCategory;
}

export interface PageInfo {
  pageNumber: number;
  pageSize: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  offset: number;
  unpaged: boolean;
  paged: boolean;
}

export interface BoardListResponse {
  content: BoardListItem[];
  pageable: PageInfo;
  totalPages: number;
  totalElements: number;
  last: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  first: boolean;
  empty: boolean;
}
