import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  email: string;
  role: string;
  founderId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await apiRequest("POST", "/api/auth/login", { email, password });
  return response.json();
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const saveAuth = (authData: AuthResponse) => {
  localStorage.setItem("token", authData.token);
  localStorage.setItem("user", JSON.stringify(authData.user));
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};
