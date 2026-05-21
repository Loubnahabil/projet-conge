// What we send to backend at login
export interface LoginRequest {
  email: string;
  password: string;
}

// What we get back from backend after login
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

// What we store in Redux about the logged in user
export interface AuthUser {
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

// Shape of auth state in Redux
export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}
