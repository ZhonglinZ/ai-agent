import { Button, Card, Space } from "antd";
import { UserOutlined, SettingOutlined } from "@ant-design/icons";

export default function Home() {
  return (
    <div className="p-8 space-y-6">
      <Card title="配置测试" className="max-w-md">
        <Space direction="vertical" className="w-full">
          <Button type="primary" icon={<UserOutlined />}>
            主要按钮
          </Button>
          <Button icon={<SettingOutlined />}>默认按钮</Button>
          <div className="text-primary-500 text-lg">Tailwind 主色调文本</div>
        </Space>
      </Card>
    </div>
  );
}
