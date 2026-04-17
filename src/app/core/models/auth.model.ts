export interface LoginRequest {
  userName: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiration: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
