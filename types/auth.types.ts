export interface LoginCredentials {
    nisn: string;
    password: string;
}

export interface LoginResponse {
    Message?: string;
    message?: string;
    access_token: string;  
    username?: string;
    role?: string;
}

export interface User {
    message: string;
    id: number;
    nisn: string;
    fullname: string;
    username: string;
    role: string;
    class_group: string;
}

// interface AuthContextType {
//   user: User | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;

//   login: (credentials: LoginCredentials) => Promise<LoginResponse>; // ✅ FIX

//   logout: () => void;
//   submitAbsen: (tokenCode: string) => Promise<{ message: string; status: string }>;
// }


/**
 * Body Login
 * {
 *  "nisn": "string",
 *  "password": "string"
 * }
 * 
 * Response Type
 * {
 *  "message": "string",
 *  "access_token": "string",
 *  "username": "string"
 * }
 */

/**
 * Get Current User
 * Required Header
 * {
 *  Authorization: "Bearer <token>"
 * }
 * 
 * Response Type
 * {
 *  message: "string",
 *  id: "integer",
 *  nisn: "string",
 *  fullname: "string",
 *  username: "string",
 *  role: "string",
 *  class_group: "string"
 * }
 */
/**
 * Post Absen Token
 * Required
 * {
 *  Authorization: "Bearer <token>",
 *  token_code: "string"
 * }
 * 
 * Response Type
 * {
 *  message: "string"
 *  status: "string"
 * }
 */
/**
 * Url
 * https://api.smart-presence.smkpluspnb.sch.id/api/v1/auth/login (login)
 * https://api.smart-presence.smkpluspnb.sch.id/api/v1/auth/me (Get current user)
 * https://api.smart-presence.smkpluspnb.sch.id/api/v1/token/absen (Post absen token)
 */