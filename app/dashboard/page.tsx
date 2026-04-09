"use client";

import { Card, Row, Col, Statistic } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { MainLayout } from "@/components/layouts/MainLayout";
import { PageLayoutProvider } from "@/lib/hooks/useLayout";

export default function Dashboard() {
  return (
    <PageLayoutProvider
      config={{
        showSidebar: true,
        showHeader: true,
        showBreadcrumb: true,
        title: "仪表盘",
      }}
    >
      <MainLayout>
        <div className="space-y-6">
          {/* 页面标题 */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">仪表盘</h1>
            <p className="text-gray-600">欢迎回来，这里是您的数据概览</p>
          </div>

          {/* 统计卡片 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总用户数"
                  value={1128}
                  prefix={<UserOutlined />}
                  styles={{ content: { color: "#3f8600" } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="订单数"
                  value={93}
                  prefix={<ShoppingCartOutlined />}
                  styles={{ content: { color: "#cf1322" } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="收入"
                  value={112893}
                  prefix={<DollarOutlined />}
                  precision={2}
                  styles={{ content: { color: "#1890ff" } }}
                />
              </Card>
            </Col>
          </Row>

          {/* 其他内容区域 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="数据趋势" className="h-96">
                <div className="flex items-center justify-center h-full text-gray-500">
                  图表区域（可以集成 ECharts 等图表库）
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="快速操作" className="h-96">
                <div className="space-y-4">
                  <button className="w-full p-3 text-left border rounded hover:bg-gray-50">
                    添加新用户
                  </button>
                  <button className="w-full p-3 text-left border rounded hover:bg-gray-50">
                    查看报告
                  </button>
                  <button className="w-full p-3 text-left border rounded hover:bg-gray-50">
                    系统设置
                  </button>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </MainLayout>
    </PageLayoutProvider>
  );
}
