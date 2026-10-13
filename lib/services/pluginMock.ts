/**
 * 插件广场 Mock 数据
 */

import type {
  PluginApiParameter,
  PluginDetail,
  PluginMarketItem,
  PluginTool,
} from "@/lib/types/plugin";

const BASE_API_URL = "https://sec-agent.mcp.volcbiz.com/sse";

const DEFAULT_INTRO_SECTIONS = [
  {
    title: "多模态信息处理能力",
    content:
      "具备解析各类文档（PDF/Excel/Word 等）、图片/照片内容的能力，可执行总结、分析、翻译及润色任务；支持读取网页链接信息，精准提取核心内容。",
  },
  {
    title: "智能创作与生成能力",
    content:
      "可根据文本描述生成或改绘图片，满足可视化创作需求；擅长文案撰写、内容润色，并能依据场景定制风格化文字。",
  },
  {
    title: "实时信息检索与计算能力",
    content:
      "支持实时信息获取与检索，适用于热点追踪、知识验证等场景；可配合计算工具进行数值与符号计算。",
  },
];

const DEFAULT_PARAMETERS: PluginApiParameter[] = [
  {
    name: "query",
    required: true,
    type: "String",
    location: "请求头",
    description: "必须搜索的关键词，用于指定搜索内容。",
  },
  {
    name: "count",
    required: true,
    type: "Number",
    location: "请求头",
    description: "返回搜索结果数量，默认值为 5，可根据需求调整。",
  },
  {
    name: "result_id",
    required: true,
    type: "String",
    location: "请求头",
    description: "从搜索结果中选取的结果 ID，用于进一步抓取详情。",
  },
  {
    name: "tool_name",
    required: false,
    type: "String",
    location: "请求体",
    description: "工具名称，用于指定执行的功能模块。",
  },
  {
    name: "language",
    required: false,
    type: "String",
    location: "请求体",
    description: "返回内容语言偏好，例如 zh-CN / en-US。",
  },
  {
    name: "timeout",
    required: false,
    type: "Number",
    location: "路径",
    description: "请求超时时间，单位秒，默认值为 30。",
  },
];

const OCR_PARAMETERS: PluginApiParameter[] = [
  {
    name: "image_url",
    required: true,
    type: "String",
    location: "请求体",
    description: "待识别的图片 URL，支持 HTTP/HTTPS 或 Base64。",
    placeholder: "请输入 image_url",
  },
  {
    name: "language",
    required: true,
    type: "String",
    location: "请求体",
    description: "识别语言，默认 auto，可选 zh/en/ja 等。",
    placeholder: "请输入 language",
  },
  {
    name: "confidence_threshold",
    required: false,
    type: "Number",
    location: "请求体",
    description: "置信度阈值（0-1），低于该值的结果将被过滤。",
    placeholder: "请输入 confidence_threshold",
  },
];

const SUMMARY_PARAMETERS: PluginApiParameter[] = [
  {
    name: "content",
    required: true,
    type: "String",
    location: "请求体",
    description: "需要总结的原始内容。",
    placeholder: "请输入 content",
  },
  {
    name: "style",
    required: false,
    type: "String",
    location: "请求体",
    description: "摘要风格，例如 executive / bullet / brief。",
    placeholder: "请输入 style",
  },
  {
    name: "max_tokens",
    required: false,
    type: "Number",
    location: "请求体",
    description: "摘要长度上限。",
    placeholder: "请输入 max_tokens",
  },
];

const ENTITY_PARAMETERS: PluginApiParameter[] = [
  {
    name: "text",
    required: true,
    type: "String",
    location: "请求体",
    description: "待抽取的文本内容。",
    placeholder: "请输入 text",
  },
  {
    name: "schema",
    required: false,
    type: "String",
    location: "请求体",
    description: "实体 schema 定义，JSON 格式。",
    placeholder: "请输入 schema",
  },
];

const DEFAULT_TOOLS: PluginTool[] = [
  {
    id: "tool_001",
    name: "recognition_text",
    description: "识别图片中的文本内容，支持多语言 OCR。",
    apiUrl: `${BASE_API_URL}?tool=recognition_text`,
    parameters: OCR_PARAMETERS,
  },
  {
    id: "tool_002",
    name: "extract_entities",
    description: "抽取文本中的关键实体与结构化字段。",
    apiUrl: `${BASE_API_URL}?tool=extract_entities`,
    parameters: ENTITY_PARAMETERS,
  },
  {
    id: "tool_003",
    name: "summarize_text",
    description: "对长文本进行摘要，支持多种风格。",
    apiUrl: `${BASE_API_URL}?tool=summarize_text`,
    parameters: SUMMARY_PARAMETERS,
  },
  {
    id: "tool_004",
    name: "fetch_webpage",
    description: "抓取网页内容并返回结构化结果。",
    apiUrl: `${BASE_API_URL}?tool=fetch_webpage`,
    parameters: [
      {
        name: "url",
        required: true,
        type: "String",
        location: "请求体",
        description: "目标网页地址。",
        placeholder: "请输入 url",
      },
      {
        name: "depth",
        required: false,
        type: "Number",
        location: "请求体",
        description: "抓取深度，默认 1。",
        placeholder: "请输入 depth",
      },
    ],
  },
];

const BASE_ITEMS: PluginMarketItem[] = [
  {
    id: "plugin_001",
    name: "代码工坊",
    owner: "@AppForge官方",
    description: "一站式代码生成与调试插件，支持多语言模板与参数化配置。",
    type: "plugin",
    icon: "⚙️",
    iconBg: "#EEF2FF",
    tags: ["开发", "代码生成"],
  },
  {
    id: "plugin_002",
    name: "LangBridge",
    owner: "@AppForge官方",
    description: "连接多模型服务的统一入口，支持多供应商路由与灰度切换。",
    type: "plugin",
    icon: "🌐",
    iconBg: "#E0F2FE",
    tags: ["模型", "路由"],
  },
  {
    id: "plugin_003",
    name: "数据洞察者",
    owner: "@AppForge官方",
    description: "自动生成分析视图与指标卡片，适合产品、运营数据诊断。",
    type: "plugin",
    icon: "📊",
    iconBg: "#E7FBE9",
    tags: ["分析", "报表"],
  },
  {
    id: "plugin_004",
    name: "文档助手",
    owner: "@AppForge官方",
    description: "从知识库中抽取关键信息，自动生成文档摘要与问答。",
    type: "plugin",
    icon: "📝",
    iconBg: "#FFF7ED",
    tags: ["文档", "摘要"],
  },
  {
    id: "plugin_005",
    name: "必应搜索",
    owner: "@AppForge官方",
    description: "必应搜索 MCP 插件，支持实时检索与结果解析。",
    type: "mcp",
    icon: "🔍",
    iconBg: "#ECFEFF",
    tags: ["检索", "情报"],
  },
  {
    id: "plugin_006",
    name: "Google Map",
    owner: "@AppForge官方",
    description: "地图数据检索与地理信息解析能力，适用于位置相关场景。",
    type: "mcp",
    icon: "📍",
    iconBg: "#FFF1F2",
    tags: ["地图", "位置"],
  },
  {
    id: "plugin_007",
    name: "CreativeSpark",
    owner: "@AppForge官方",
    description: "为创意任务提供灵感扩展、文案润色与多版本生成。",
    type: "plugin",
    icon: "✨",
    iconBg: "#F5F3FF",
    tags: ["创意", "文案"],
  },
  {
    id: "plugin_008",
    name: "MindMapper",
    owner: "@AppForge官方",
    description: "将复杂内容拆解为思维导图，支持一键生成与导出。",
    type: "plugin",
    icon: "🧠",
    iconBg: "#F0FDFA",
    tags: ["思维导图", "整理"],
  },
  {
    id: "plugin_009",
    name: "LangBridge MCP",
    owner: "@AppForge官方",
    description: "提供模型能力的 MCP 工具封装，便于统一接入与控制。",
    type: "mcp",
    icon: "🧩",
    iconBg: "#EFF6FF",
    tags: ["MCP", "模型"],
  },
  {
    id: "plugin_010",
    name: "数据净化器",
    owner: "@AppForge官方",
    description: "文本清洗与结构化整理工具，适合批量数据预处理。",
    type: "mcp",
    icon: "🧹",
    iconBg: "#FEFCE8",
    tags: ["清洗", "预处理"],
  },
  {
    id: "plugin_011",
    name: "Fetch 工具箱",
    owner: "@AppForge官方",
    description: "统一管理外部数据抓取与缓存策略，适配多种源。",
    type: "mcp",
    icon: "🧰",
    iconBg: "#ECFDF3",
    tags: ["抓取", "缓存"],
  },
  {
    id: "plugin_012",
    name: "体验优化器",
    owner: "@AppForge官方",
    description: "自动化追踪用户路径并给出体验优化建议。",
    type: "plugin",
    icon: "🎯",
    iconBg: "#F5F5FF",
    tags: ["体验", "优化"],
  },
];

const buildMeta = (typeLabel: string, owner: string): PluginDetail["meta"] => [
  { label: "类型", value: typeLabel },
  { label: "发布时间", value: "2025-05-05 15:15:15" },
  { label: "发布者", value: owner },
  { label: "扩展位置", value: "智能体 / 工作流" },
  { label: "扩展位置", value: "知识库 / 插件" },
];

const buildDetail = (item: PluginMarketItem): PluginDetail => {
  const typeLabel = item.type === "plugin" ? "插件" : "MCP工具";
  return {
    ...item,
    meta: buildMeta(typeLabel, item.owner),
    introSections: DEFAULT_INTRO_SECTIONS,
    apiUrl: `${BASE_API_URL}?plugin=${item.id}`,
    apiMethod: "POST",
    parameters: DEFAULT_PARAMETERS,
    tools: item.type === "mcp" ? DEFAULT_TOOLS : undefined,
  };
};

export const MOCK_PLUGIN_DETAILS: PluginDetail[] = BASE_ITEMS.map(buildDetail);

export const MOCK_PLUGINS: PluginMarketItem[] = MOCK_PLUGIN_DETAILS;

export const getMockPluginDetail = (id: string): PluginDetail | null => {
  return MOCK_PLUGIN_DETAILS.find((item) => item.id === id) || null;
};
