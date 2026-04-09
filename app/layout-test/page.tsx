// app/layout-test/page.tsx
"use client";

import { MainLayout } from "@/components/layouts/MainLayout";
import { PageLayoutProvider } from "@/lib/hooks/useLayout";
import { Card, Button, Space } from "antd";

export default function LayoutTestPage() {
  return (
    <PageLayoutProvider
      config={{
        showSidebar: true,
        showHeader: true,
        showBreadcrumb: true,
      }}
    >
      <MainLayout>
        <div className="space-y-6">
          <Card title="布局测试页面">
            <p>这是一个测试页面，用于验证布局系统是否正常工作。</p>
            <Space>
              <Button type="primary">主要按钮</Button>
              <Button>次要按钮</Button>
            </Space>
          </Card>
        </div>
      </MainLayout>
    </PageLayoutProvider>
  );
}
