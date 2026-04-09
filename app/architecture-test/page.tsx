// app/architecture-test/page.tsx
"use client";

import { Button, Card, Space, message, Divider, Tag } from "antd";
import { useApi, usePaginatedApi } from "@/lib/hooks/useApi";
import { userApi } from "@/lib/services/api";
import {
  formatDate,
  formatRelativeTime,
  generateId,
  formatFileSize,
  maskPhone,
  maskEmail,
  debounce,
} from "@/lib/utils";
import { USER_STATUS, USER_ROLES, MESSAGE_TYPES } from "@/lib/constants";
import { useState } from "react";

export default function ArchitectureTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  // 测试 API Hooks
  const { data, loading, error, execute } = useApi(() => userApi.getUsers(), {
    immediate: false,
    onSuccess: (data) => {
      addTestResult("✅ API Hook 成功获取数据");
    },
    onError: (error) => {
      addTestResult(`❌ API Hook 错误: ${error}`);
    },
  });

  // 测试分页 Hook
  const {
    data: users,
    total,
    loading: usersLoading,
    changePage,
  } = usePaginatedApi(userApi.getUsers);

  const addTestResult = (result: string) => {
    setTestResults((prev) => [...prev, `${formatDate(new Date())}: ${result}`]);
  };

  // 测试工具函数
  const testUtils = () => {
    const testData = [
      `随机ID: ${generateId()}`,
      `当前时间: ${formatDate(new Date())}`,
      `相对时间: ${formatRelativeTime(new Date(Date.now() - 3600000))}`,
      `文件大小: ${formatFileSize(1024 * 1024 * 5.5)}`,
      `手机号脱敏: ${maskPhone("13812345678")}`,
      `邮箱脱敏: ${maskEmail("zhangsan@example.com")}`,
    ];

    testData.forEach((result) => addTestResult(`🔧 ${result}`));
    message.success("工具函数测试完成");
  };

  // 测试常量
  const testConstants = () => {
    const constantTests = [
      `用户状态: ${Object.values(USER_STATUS).join(", ")}`,
      `用户角色: ${Object.values(USER_ROLES).join(", ")}`,
      `消息类型: ${Object.values(MESSAGE_TYPES).join(", ")}`,
    ];

    constantTests.forEach((result) => addTestResult(`📋 ${result}`));
    message.success("常量测试完成");
  };

  // 测试防抖函数
  const debouncedTest = debounce(() => {
    addTestResult("🚀 防抖函数执行");
    message.info("防抖测试完成");
  }, 1000);

  return (
    <div className="p-6 space-y-6">
      <Card title="🏗️ 核心架构测试" className="w-full">
        <Space orientation="vertical" className="w-full" size="large">
          {/* HTTP 服务测试 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">🌐 HTTP 服务层测试</h3>
            <Space wrap>
              <Button type="primary" onClick={execute} loading={loading}>
                测试 API 调用
              </Button>
              <Button onClick={() => changePage(2)} loading={usersLoading}>
                测试分页 (第2页)
              </Button>
              {error && <Tag color="red">错误: {error}</Tag>}
              {data && <Tag color="green">数据加载成功</Tag>}
            </Space>
          </div>

          <Divider />

          {/* 工具函数测试 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">🛠️ 工具函数测试</h3>
            <Space wrap>
              <Button onClick={testUtils}>测试工具函数</Button>
              <Button onClick={debouncedTest}>测试防抖函数</Button>
            </Space>
          </div>

          <Divider />

          {/* 常量管理测试 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">📋 常量管理测试</h3>
            <Button onClick={testConstants}>测试常量定义</Button>
          </div>

          <Divider />

          {/* 测试结果显示 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">📊 测试结果</h3>
            <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">暂无测试结果</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="text-sm mb-1 font-mono">
                    {result}
                  </div>
                ))
              )}
            </div>
            <Button
              size="small"
              className="mt-2"
              onClick={() => setTestResults([])}
            >
              清空结果
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
}
