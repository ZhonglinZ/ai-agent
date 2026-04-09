"use client";

import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { DashboardOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";

const { Sider } = Layout;

// 定义侧边栏组件的属性
interface SidebarProps {
  collapsed: boolean; // 是否折叠
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const pathname = usePathname(); // 获取当前路径
  const router = useRouter(); // 路由对象

  // 管理菜单展开状态
  const [openKeys, setOpenKeys] = useState<string[]>(["users-group"]);

  // 定义菜单项配置
  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "仪表盘",
    },
    {
      key: "users-group", // 注意：这里用非路径的 key，避免和路由冲突
      icon: <UserOutlined />,
      label: "用户管理",
      children: [
        {
          key: "/users/list",
          label: "用户列表",
        },
        {
          key: "/users/roles",
          label: "角色管理",
        },
      ],
    },
  ];

  // 处理菜单点击事件
  const handleMenuClick: MenuProps["onClick"] = (e) => {
    // 只有叶子节点（实际页面）才进行路由跳转
    if (e.key.startsWith("/")) {
      router.push(e.key);
    }
  };

  // 处理菜单展开/收起
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <Sider
      trigger={null} // 不显示默认的折叠按钮
      collapsible // 支持折叠
      collapsed={collapsed} // 折叠状态
      className="fixed left-0 top-0 bottom-0 z-20 bg-white border-r border-gray-200"
      width={256} // 展开时的宽度
      collapsedWidth={80} // 折叠时的宽度
      breakpoint="lg" // 在 lg 断点以下自动折叠
      onBreakpoint={(broken) => {
        // 可以在这里处理断点变化
        console.log("断点变化:", broken);
      }}
    >
      {/* Logo 区域 */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {/* 应用图标 */}
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {/* 应用名称 - 只在展开时显示 */}
          {!collapsed && (
            <div className="text-gray-800 font-semibold text-lg tracking-wide">
              Admin Pro
            </div>
          )}
        </div>
      </div>

      {/* 菜单区域 */}
      <div className="py-2">
        <Menu
          mode="inline" // 内联模式
          selectedKeys={[pathname]} // 当前选中的菜单项
          openKeys={openKeys} // 当前展开的菜单组
          onOpenChange={handleOpenChange} // 展开状态变化回调
          items={menuItems} // 菜单项配置
          onClick={handleMenuClick} // 点击回调
          className="border-r-0" // 移除右边框
          inlineIndent={20} // 子菜单缩进
        />
      </div>
    </Sider>
  );
};

export default Sidebar;
