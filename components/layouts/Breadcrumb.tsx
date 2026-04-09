"use client";

import React from "react";
import { Breadcrumb as AntBreadcrumb } from "antd";
import type { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import { usePathname } from "next/navigation";
import {
  HomeOutlined,
  UserOutlined,
  DashboardOutlined,
} from "@ant-design/icons";

const Breadcrumb: React.FC = () => {
  const pathname = usePathname();

  // 路径到标题的映射配置
  // 这里可以根据实际项目需求进行扩展
  const pathMap: Record<string, { title: string; icon?: React.ReactNode }> = {
    "/": { title: "首页", icon: <HomeOutlined /> },
    "/dashboard": { title: "仪表盘", icon: <DashboardOutlined /> },
    "/users": { title: "用户管理", icon: <UserOutlined /> },
    "/users/list": { title: "用户列表" },
    "/users/roles": { title: "角色管理" },
    // "/layout-test": { title: "布局测试" },
  };

  // 生成面包屑项目
  const generateBreadcrumbItems = (): ItemType[] => {
    // 分割路径，过滤空字符串
    const pathSegments = pathname.split("/").filter(Boolean);

    // 始终包含首页
    const items: ItemType[] = [
      {
        title: (
          <span className="flex items-center">
            <HomeOutlined className="mr-1" />
            首页
          </span>
        ),
        href: "/",
      },
    ];

    // 逐级构建路径
    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const config = pathMap[currentPath];

      if (config) {
        const isLast = index === pathSegments.length - 1;
        const item: ItemType = {
          title: (
            <span className="flex items-center">
              {config.icon && <span className="mr-1">{config.icon}</span>}
              {config.title}
            </span>
          ),
          // 最后一项不设置链接（当前页面）
          href: isLast ? undefined : currentPath,
        };
        items.push(item);
      }
    });

    return items;
  };

  const items = generateBreadcrumbItems();

  return (
    <div className="mb-6">
      <AntBreadcrumb items={items} />
    </div>
  );
};

export default Breadcrumb;
