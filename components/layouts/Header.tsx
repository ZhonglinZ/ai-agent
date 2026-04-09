"use client";

import React from "react";
import { Layout, Button, Space, Avatar, Dropdown } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

const { Header: AntHeader } = Layout;

// 定义头部组件的属性
interface HeaderProps {
  showMenuButton?: boolean; // 是否显示菜单按钮
  onMenuClick?: () => void; // 菜单按钮点击回调
  collapsed?: boolean; // 侧边栏是否折叠
}

export const Header: React.FC<HeaderProps> = ({
  showMenuButton = true,
  onMenuClick,
  collapsed = false,
}) => {
  // 用户下拉菜单配置
  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人资料",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "设置",
    },
    {
      type: "divider", // 分割线
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      danger: true, // 危险操作样式
    },
  ];

  // 处理用户菜单点击
  const handleUserMenuClick: MenuProps["onClick"] = (e) => {
    switch (e.key) {
      case "logout":
        // TODO: 实现退出登录逻辑
        console.log("退出登录");
        break;
      case "profile":
        // TODO: 跳转到个人资料页面
        console.log("个人资料");
        break;
      case "settings":
        // TODO: 跳转到设置页面
        console.log("设置");
        break;
    }
  };

  return (
    <AntHeader className="flex items-center justify-between px-6 bg-white border-b border-gray-200 h-16">
      {/* 左侧区域：菜单控制按钮 */}
      <div className="flex items-center">
        {showMenuButton && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onMenuClick}
            className="text-lg hover:bg-gray-100"
            title={collapsed ? "展开菜单" : "收起菜单"}
          />
        )}
      </div>

      {/* 右侧区域：用户操作 */}
      <div className="flex items-center">
        <Space size="middle">
          {/* 通知按钮 */}
          <Button
            type="text"
            icon={<BellOutlined />}
            className="text-lg hover:bg-gray-100"
            title="通知"
          />

          {/* 用户下拉菜单 */}
          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: handleUserMenuClick,
            }}
            placement="bottomRight"
            arrow
          >
            <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
              <Avatar size="small" icon={<UserOutlined />} />
              <span className="text-sm font-medium text-gray-700">管理员</span>
            </div>
          </Dropdown>
        </Space>
      </div>
    </AntHeader>
  );
};
