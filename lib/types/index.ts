import { ReactNode } from "react";
import { ORDER_STATUS, PAYMENT_STATUS, PRODUCT_STATUS, ROUTES, USER_ROLES, USER_STATUS } from "../constants";

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
 * 菜单项
 */
export interface MenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  children?: MenuItem[];
  path?: string;
}

// 用户类型定义
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "user" | "guest";
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

// 分页参数类型
export interface PaginationParams {
  current: number; // 当前页码
  pageSize: number; // 每页条数
}

// 分页响应类型
export interface PaginatedResponse<T> {
  list: T[]; // 数据列表
  total: number; // 总条数
  current: number; // 当前页码
  pageSize: number; // 每页条数
}

// 导出类型
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export type ProductStatus =
  (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];
export type RouteKey = keyof typeof ROUTES;
