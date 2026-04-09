"use client";

import React, { useState, useCallback } from "react";
import { Layout } from "antd";
import {
  useSidebarVisibility,
  useHeaderVisibility,
  useContainerClassName,
  useBreadcrumbVisibility,
} from "@/lib/hooks/useLayout";
import Sidebar from "./Sidebar";
import { Header } from "./Header";
import Breadcrumb from "./Breadcrumb";

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // 侧边栏折叠状态
  const [collapsed, setCollapsed] = useState(false);

  // 使用布局控制 Hooks
  const showSidebar = useSidebarVisibility();
  const showHeader = useHeaderVisibility();
  const showBreadcrumb = useBreadcrumbVisibility();
  const containerClassName = useContainerClassName();

  // 切换侧边栏状态
  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  // 场景1：最简布局 - 不显示侧边栏和头部
  if (!showSidebar && !showHeader) {
    return <div className={containerClassName}>{children}</div>;
  }

  // 场景2：仅头部布局 - 只显示头部，不显示侧边栏
  if (!showSidebar && showHeader) {
    return (
      <Layout className="min-h-screen">
        {showHeader && (
          <Header
            showMenuButton={true}
            onMenuClick={toggleSidebar}
            collapsed={collapsed}
          />
        )}
        <Content className="bg-white min-h-[calc(100vh-64px)] overflow-auto">
          <div className={containerClassName}>
            {showBreadcrumb && <Breadcrumb />}
            {children}
          </div>
        </Content>
      </Layout>
    );
  }

  // 场景3：完整布局 - 显示侧边栏和头部
  return (
    <Layout className="min-h-screen">
      {/* 侧边栏占位符 */}
      <Sidebar collapsed={collapsed} />

      {/* 主内容区域 */}
      <Layout>
        {/* 头部占位符 */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <button
            onClick={toggleSidebar}
            className="mr-4 px-2 py-1 border rounded hover:bg-gray-50"
          >
            {collapsed ? "展开" : "收起"}
          </button>
          <span className="font-semibold">应用头部</span>
        </div>

        <Content className="bg-white min-h-[calc(100vh-64px)] overflow-auto">
          <div className={containerClassName}>
            {showBreadcrumb && <Breadcrumb />}
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
