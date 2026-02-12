import { http } from "./http";
import type { User, PaginationParams, PaginatedResponse } from "@/lib/types";

/**
 * 用户相关 API 服务
 */
export const userApi = {
  // 获取用户列表（支持分页和搜索）
  getUsers: (params?: PaginationParams & { search?: string }) => {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    if (params?.current) queryParams.set("current", params.current.toString());
    if (params?.pageSize)
      queryParams.set("pageSize", params.pageSize.toString());
    if (params?.search) queryParams.set("search", params.search);

    const queryString = queryParams.toString();
    const url = queryString ? `/users?${queryString}` : "/users";

    return http.get<PaginatedResponse<User>>(url);
  },

  // 获取单个用户详情
  getUser: (id: string) => http.get<User>(`/users/${id}`),

  // 创建新用户
  createUser: (data: Omit<User, "id" | "createdAt" | "updatedAt">) =>
    http.post<User>("/users", data),

  // 更新用户信息
  updateUser: (id: string, data: Partial<User>) =>
    http.put<User>(`/users/${id}`, data),

  // 删除用户
  deleteUser: (id: string) => http.delete<void>(`/users/${id}`),
};

/**
 * 认证相关 API 服务
 */
export const authApi = {
  // 用户登录
  login: (credentials: { email: string; password: string }) =>
    http.post<{ token: string; user: User }>("/auth/login", credentials),

  // 用户登出
  logout: () => http.post<void>("/auth/logout"),

  // 获取当前登录用户信息
  getCurrentUser: () => http.get<User>("/auth/me"),

  // 刷新访问令牌
  refreshToken: () => http.post<{ token: string }>("/auth/refresh"),
};
