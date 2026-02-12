// 创建测试页面 app/api-test/page.tsx
"use client";

import { Button, Card, Space, Spin, Alert } from "antd";
import { useApi, usePaginatedApi } from "@/lib/hooks/useApi";
import { userApi } from "@/lib/services/api";

export default function ApiTestPage() {
  // 测试基础 API Hook
  const {
    data: user,
    loading: userLoading,
    error: userError,
    execute: fetchUser,
  } = useApi(
    () => userApi.getUser("1"),
    { immediate: false }, // 不自动执行
  );

  // 测试分页 API Hook
  const {
    data: users,
    total,
    loading: usersLoading,
    error: usersError,
    changePage,
    changeParams,
    refresh,
  } = usePaginatedApi(userApi.getUsers);

  return (
    <div className="p-6 space-y-6">
      <Card title="API Hooks 测试">
        <Space direction="vertical" className="w-full">
          {/* 单个用户测试 */}
          <div>
            <h3>单个用户数据</h3>
            <Space>
              <Button onClick={fetchUser} loading={userLoading}>
                获取用户
              </Button>
              {userError && <Alert message={userError} type="error" />}
              {user && <span>用户名: {user.name}</span>}
            </Space>
          </div>

          {/* 用户列表测试 */}
          <div>
            <h3>用户列表数据</h3>
            <Space>
              <Button onClick={refresh} loading={usersLoading}>
                刷新列表
              </Button>
              <Button onClick={() => changePage(2)}>第二页</Button>
              <Button onClick={() => changeParams({ search: "张三" })}>
                搜索张三
              </Button>
            </Space>

            {usersLoading && <Spin />}
            {usersError && <Alert title={usersError} type="error" />}
            {users.length > 0 && (
              <div>
                <p>总数: {total}</p>
                <ul>
                  {users.map((user) => (
                    <li key={user.id}>
                      {user.name} - {user.email}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Space>
      </Card>
    </div>
  );
}
