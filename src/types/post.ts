// 게시글 관련 타입 정의

// 카테고리: 백엔드에서 동적으로 추가될 수 있으므로 string 타입 사용
export type PostCategory = string;

// 카테고리 응답: 동적으로 추가될 수 있으므로 Record 타입 사용
export type PostCategoriesResponse = Record<string, string>;

export interface Post {
  id: number;
  title: string;
  content: string;
  boardCategory: PostCategory;
  imageUrl?: string;
  createdAt: string;
}

export interface PostListItem {
  id: number;
  title: string;
  category: PostCategory;
  createdAt: string;
}

export interface PostCreateRequest {
  title: string;
  content: string;
  category: PostCategory;
}

export interface PostUpdateRequest {
  title: string;
  content: string;
  category: PostCategory;
}

export interface PostFormData {
  title: string;
  content: string;
  category: PostCategory;
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

export interface PostListResponse {
  content: PostListItem[];
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
