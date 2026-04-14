import type { PageLayoutConfig } from '@/lib/hooks/useLayout';

/**
 * 默认布局配置
 * 大多数页面都会使用这个配置
 */
export const DEFAULT_LAYOUT: PageLayoutConfig = {
  showSidebar: true,
  showHeader: true,
  showBreadcrumb: true,
  containerClassName: 'p-6',
};

/**
 * 特殊页面的布局配置
 * 根据路径匹配对应的布局
 */
export const PAGE_LAYOUTS: Record<string, PageLayoutConfig> = {
  // 登录页面 - 最简布局
  '/login': {
    showSidebar: false,
    showHeader: false,
    showBreadcrumb: false,
    containerClassName: 'min-h-screen flex items-center justify-center bg-gray-50',
  },

  // 全屏展示页面 - 无任何布局元素
  '/fullscreen': {
    showSidebar: false,
    showHeader: false,
    showBreadcrumb: false,
    containerClassName: 'h-screen w-screen',
  },

  // 内容展示页面 - 仅头部
  '/content-only': {
    showSidebar: false,
    showHeader: true,
    showBreadcrumb: true,
    containerClassName: 'p-6 max-w-4xl mx-auto',
  },
};

/**
 * 根据路径获取布局配置
 * @param pathname 当前页面路径
 * @returns 对应的布局配置
 */
export function getPageLayout(pathname: string): PageLayoutConfig {
  return PAGE_LAYOUTS[pathname] || DEFAULT_LAYOUT;
}

/**
 * 检查路径是否需要特殊布局
 * @param pathname 当前页面路径
 * @returns 是否有特殊布局配置
 */
export function hasCustomLayout(pathname: string): boolean {
  return pathname in PAGE_LAYOUTS;
}

export const EXPLICIT_ROUTE_LAYOUTS: Record<string, Partial<PageLayoutConfig>> = {
  // ... 其他配置

  // 工作流编辑器 - 全屏编辑布局
  '/workflow/editor': {
    showSidebar: false,
    showHeader: false,
    showBreadcrumb: false,
    showFooter: false,
    containerClassName: 'min-h-screen',
    title: '工作流编辑器',
  },
};