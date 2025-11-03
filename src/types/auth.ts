// 인증 관련 타입 정의

export interface SignUpRequest {
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface SignInRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface User {
  username: string;
  name: string;
}
