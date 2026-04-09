import React, { createContext, useContext } from "react";

// 定义页面布局配置的类型
export interface PageLayoutConfig {
  showSidebar?: boolean; // 是否显示侧边栏
  showHeader?: boolean; // 是否显示头部
  showBreadcrumb?: boolean; // 是否显示面包屑
  containerClassName?: string; // 容器样式类名
  title?: string; // 页面标题
}

// 创建布局上下文
const PageLayoutContext = createContext<PageLayoutConfig | undefined>(
  undefined
);

// 获取布局配置的 Hook
export function usePageLayout() {
  const context = useContext(PageLayoutContext);
  return context;
}

// 布局提供者组件
interface PageLayoutProviderProps {
  children: React.ReactNode;
  config?: PageLayoutConfig;
}

export function PageLayoutProvider({
  children,
  config,
}: PageLayoutProviderProps) {
  return (
    <PageLayoutContext.Provider value={config}>
      {children}
    </PageLayoutContext.Provider>
  );
}

// 侧边栏可见性 Hook
export function useSidebarVisibility() {
  const layout = usePageLayout();
  return layout?.showSidebar ?? true; // 默认显示
}

// 头部可见性 Hook
export function useHeaderVisibility() {
  const layout = usePageLayout();
  return layout?.showHeader ?? true; // 默认显示
}

// 面包屑可见性 Hook
export function useBreadcrumbVisibility() {
  const layout = usePageLayout();
  return layout?.showBreadcrumb ?? true; // 默认显示
}

// 容器类名 Hook
export function useContainerClassName() {
  const layout = usePageLayout();
  return layout?.containerClassName ?? "p-6"; // 默认内边距
}
