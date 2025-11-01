import { apiClient } from '../utils/axios';
import type { BoardListResponse, BoardCreateRequest } from '../types/board';

export const getBoards = async (page = 0, size = 10): Promise<BoardListResponse> => {
  const response = await apiClient.get<BoardListResponse>('/boards', {
    params: { page, size },
  });
  return response.data;
};

export const createBoard = async (
  data: BoardCreateRequest,
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
