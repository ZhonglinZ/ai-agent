"use client";

import React, { useState } from "react";
import { Table, Card, Input, Button, Space, Tooltip } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import type { TableProps } from "antd/es/table";

// 定义表格组件的属性接口
interface DataTableProps<T = any> extends Omit<TableProps<T>, "title"> {
  title?: string; // 表格标题
  extra?: React.ReactNode; // 额外的操作按钮
  showSearch?: boolean; // 是否显示搜索框
  showRefresh?: boolean; // 是否显示刷新按钮
  searchPlaceholder?: string; // 搜索框占位符
  onSearch?: (value: string) => void; // 搜索回调
  onRefresh?: () => void; // 刷新回调
}

export function DataTable<T extends Record<string, any>>({
  title,
  extra,
  showSearch = true,
  showRefresh = true,
  searchPlaceholder = "请输入搜索关键词",
  onSearch,
  onRefresh,
  className,
  ...tableProps
}: DataTableProps<T>) {
  // 搜索框的值
  const [searchValue, setSearchValue] = useState("");

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  // 处理刷新
  const handleRefresh = () => {
    onRefresh?.();
  };

  // 表格头部内容
  const cardTitle = (
    <div className="flex items-center justify-between">
      <span className="text-lg font-semibold">{title}</span>
      <Space>
        {/* 搜索框 */}
        {showSearch && (
          <Input.Search
            placeholder={searchPlaceholder}
            allowClear
            style={{ width: 250 }}
            onSearch={handleSearch}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        )}
        {/* 刷新按钮 */}
        {showRefresh && (
          <Tooltip title="刷新">
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} />
          </Tooltip>
        )}
        {/* 额外的操作按钮 */}
        {extra}
      </Space>
    </div>
  );

  return (
    <Card title={cardTitle}>
      <Table
        {...tableProps}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          ...tableProps.pagination,
        }}
      />
    </Card>
  );
}
