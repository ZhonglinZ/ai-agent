/**
 * 用户服务层
 * 负责所有用户相关的 API 调用
 */

import { http } from './http';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  GetUsersParams,
  UserStats,
  UserDetail,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ImportUserData,
  ExportUsersConfig,
} from '@/lib/types/user';
import type { ApiResponse, PaginatedResponse, IdParams, BatchParams } from '@/lib/types/api';

/**
 * 用户服务类
 */
export class UserService {
  private readonly baseUrl = '/users';

  /**
   * 获取用户列表
   */
  async getUsers(params?: GetUsersParams): Promise<PaginatedResponse<User>> {
    const response = await http.get<PaginatedResponse<User>>(this.baseUrl, params);
    return response.data;
  }

  /**
   * 获取用户详情
   */
  async getUserById(id: number): Promise<UserDetail> {
    const response = await http.get<UserDetail>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * 创建用户
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await http.post<User>(this.baseUrl, data);
    return response.data;
  }

  /**
   * 更新用户
   */
  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await http.put<User>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * 删除用户
   */
  async deleteUser(id: number): Promise<void> {
    await http.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * 批量删除用户
   */
  async batchDeleteUsers(ids: number[]): Promise<void> {
    await http.delete(`${this.baseUrl}/batch`, { data: { ids } });
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(): Promise<UserStats> {
    const response = await http.get<UserStats>(`${this.baseUrl}/stats`);
    return response.data;
  }

  /**
   * 修改密码
   */
  async changePassword(id: number, data: ChangePasswordRequest): Promise<void> {
    await http.post(`${this.baseUrl}/${id}/change-password`, data);
  }

  /**
   * 重置密码
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await http.post(`${this.baseUrl}/reset-password`, data);
  }

  /**
   * 启用/禁用用户
   */
  async toggleUserStatus(id: number): Promise<User> {
    const response = await http.patch<User>(`${this.baseUrl}/${id}/toggle-status`);
    return response.data;
  }

  /**
   * 批量更新用户状态
   */
  async batchUpdateStatus(ids: number[], status: 'active' | 'inactive'): Promise<void> {
    await http.patch(`${this.baseUrl}/batch/status`, {
      ids,
      status,
    });
  }

  /**
   * 导入用户
   */
  async importUsers(file: File): Promise<{ success: number; failed: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await http.post<{
      success: number;
      failed: number;
      errors: string[];
    }>(`${this.baseUrl}/import`, formData);

    return response.data;
  }

  /**
   * 导出用户
   */
  async exportUsers(config: ExportUsersConfig): Promise<Blob> {
    const response = await http.post<any>(`${this.baseUrl}/export`, config, {
      responseType: 'blob',
    } as any);
    return response.data;
  }

  /**
   * 搜索用户
   */
  async searchUsers(keyword: string): Promise<User[]> {
    const response = await http.get<User[]>(`${this.baseUrl}/search`, { keyword });
    return response.data;
  }

  /**
   * 获取用户权限
   */
  async getUserPermissions(id: number): Promise<string[]> {
    const response = await http.get<string[]>(`${this.baseUrl}/${id}/permissions`);
    return response.data;
  }

  /**
   * 更新用户权限
   */
  async updateUserPermissions(id: number, permissions: string[]): Promise<void> {
    await http.put(`${this.baseUrl}/${id}/permissions`, { permissions });
  }
}

// 导出单例实例
export const userService = new UserService();
