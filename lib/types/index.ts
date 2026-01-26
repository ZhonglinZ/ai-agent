import { ReactNode } from "react";

/**
 * 基础 API 响应类型
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  current: number;
  pageSize: number;
  total?: number;
}

/**
 * 布局配置
 */
export interface LayoutConfig {
  showSidebar?: boolean;
  showHeader?: boolean;
  showBreadcrumb?: boolean;
  containerClassName?: string;
}

/**
 * 页面布局配置
 */
export interface PageLayoutConfig extends LayoutConfig {
  title?: string;
  description?: string;
}

/**
 * 用户信息
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

/**
 * 菜单项
 */
export interface MenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  children?: MenuItem[];
  path?: string;
}
