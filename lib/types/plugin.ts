// 插件类型：普通插件 或 MCP 工具
export type PluginType = "plugin" | "mcp";

// 元信息字段（用于左侧信息卡片）
export interface PluginMetaField {
  label: string;
  value: string;
}

// 介绍段落（用于右侧介绍区）
export interface PluginIntroSection {
  title: string;
  content: string;
}

// 接口参数定义
export interface PluginApiParameter {
  name: string;
  required: boolean;
  type: string;
  location: string;
  description: string;
  placeholder?: string;
}

// MCP 工具定义
export interface PluginTool {
  id: string;
  name: string;
  description: string;
  apiUrl: string;
  parameters: PluginApiParameter[];
}

// 插件列表项（用于广场列表）
export interface PluginMarketItem {
  id: string;
  name: string;
  owner: string;
  description: string;
  type: PluginType;
  icon: string;
  iconBg: string;
  tags?: string[];
}

// 插件详情（继承列表项，扩展详情字段）
export interface PluginDetail extends PluginMarketItem {
  meta: PluginMetaField[];
  introSections: PluginIntroSection[];
  apiUrl: string;
  apiMethod: string;
  parameters: PluginApiParameter[];
  // 只有 MCP 工具才有
  tools?: PluginTool[];
}
