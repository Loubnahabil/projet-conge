// what we send to backend at login
export interface LoginRequest {
  email: string;
  password: string;
}

// what we get back from backend after login
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

// what we store in Redux about the logged in user
export interface AuthUser {
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

// shape of auth state in Redux
export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}
