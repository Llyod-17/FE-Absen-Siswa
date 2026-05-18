import { LoginCredentials, LoginResponse, User } from "@/types/auth.types";

const API_BASE_URL = "/api/v1";

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Login failed");
    }

    const data = await response.json();

    const token =
      data.access_token ??
      data.accessToken ??
      data.token ??
      data?.data?.access_token;

    if (!token) {
      throw new Error("Token tidak ditemukan di response backend");
    }

    localStorage.setItem("authToken", token);
    // mirror ke cookie utk middleware
    document.cookie = `authToken=${token}; path=/`;

    return {
      message: data.message,
      access_token: token,
      role: data.role,
    };
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      localStorage.removeItem("authToken");
      return null;
    }

    const responseData = await response.json();
    return responseData.data as User;
  },

  submitAbsenToken: async (
    tokenCode: string
  ): Promise<{ message: string; status: string }> => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_BASE_URL}/token/absen`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token_code: tokenCode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "Failed submit absen");
    }

    return response.json();
  },

  logout: async (): Promise<void> => {
    try {
      const token = localStorage.getItem("authToken");

      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      }
    } catch (err) {
      console.error("Logout API failed:", err);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      document.cookie = "authToken=; path=/; max-age=0";
    }
  },
};