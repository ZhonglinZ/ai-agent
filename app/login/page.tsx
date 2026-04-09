// app/login/page.tsx
"use client";

import { Card, Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { MainLayout } from "@/components/layouts/MainLayout";
import { PageLayoutProvider } from "@/lib/hooks/useLayout";

export default function LoginPage() {
  const onFinish = (values: any) => {
    console.log("登录信息:", values);
  };

  return (
    <PageLayoutProvider
      config={{
        showSidebar: false,
        showHeader: false,
        showBreadcrumb: false,
        containerClassName:
          "min-h-screen flex items-center justify-center bg-gray-50",
      }}
    >
      <MainLayout>
        <Card className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">登录</h1>
            <p className="text-gray-600 mt-2">请输入您的账号信息</p>
          </div>

          <Form onFinish={onFinish} layout="vertical">
            <Form.Item
              name="username"
              rules={[{ required: true, message: "请输入用户名" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" block>
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </MainLayout>
    </PageLayoutProvider>
  );
}
