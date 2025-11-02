import { apiClient } from '../utils/axios';
import type { PostListResponse, PostCreateRequest, Post, PostCategoriesResponse } from '../types/post';

export const getPosts = async (page = 0, size = 10): Promise<PostListResponse> => {
  const response = await apiClient.get<PostListResponse>('/boards', {
    params: { page, size },
  });
  return response.data;
};

export const createPost = async (
  data: PostCreateRequest,
  file?: File
): Promise<{ id: number }> => {
  const formData = new FormData();

  // request 필드: JSON 형식
  const requestBlob = new Blob([JSON.stringify(data)], {
    type: 'application/json',
  });
  formData.append('request', requestBlob);

  // file 필드 (선택)
  if (file) {
    formData.append('file', file);
  }

  const response = await apiClient.post<{ id: number }>('/boards', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getPostDetail = async (id: number): Promise<Post> => {
  const response = await apiClient.get<Post>(`/boards/${id}`);
  return response.data;
};

export const getCategories = async (): Promise<PostCategoriesResponse> => {
  const response = await apiClient.get<PostCategoriesResponse>('/boards/categories');
  return response.data;
};

