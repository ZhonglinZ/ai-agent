/**
 * 知识库 Mock 数据
 *
 * 提供预置的示例数据，用于演示和测试
 */

import type {
  KnowledgeBase,
  KnowledgeDocument,
  DocumentDetail,
  DocumentChapter,
  DocumentChunk,
  KnowledgeTag,
} from "@/lib/types/knowledge";

/**
 * 预置标签
 */
export const MOCK_TAGS: KnowledgeTag[] = [
  { id: "tag_1", name: "产品文档", color: "#1890ff", count: 2 },
  { id: "tag_2", name: "技术文档", color: "#52c41a", count: 1 },
  { id: "tag_3", name: "用户手册", color: "#faad14", count: 1 },
  { id: "tag_4", name: "FAQ", color: "#eb2f96", count: 0 },
];

/**
 * 预置知识库列表
 */
export const MOCK_KNOWLEDGE_BASES: KnowledgeBase[] = [
  {
    id: "kb_001",
    name: "产品使用手册",
    description: "包含产品的完整使用说明、功能介绍和常见问题解答",
    icon: "📘",
    fileType: "text",
    fileCount: 2,
    charCount: 15680,
    chunkCount: 32,
    status: "active",
    tags: ["产品文档", "用户手册"],
    createdAt: "2025-12-20T10:00:00.000Z",
    updatedAt: "2025-12-22T15:30:00.000Z",
  },
  {
    id: "kb_002",
    name: "技术架构文档",
    description: "系统技术架构、API接口文档和开发规范",
    icon: "🔧",
    fileType: "text",
    fileCount: 3,
    charCount: 28450,
    chunkCount: 58,
    status: "active",
    tags: ["技术文档"],
    createdAt: "2025-12-18T09:00:00.000Z",
    updatedAt: "2025-12-21T11:20:00.000Z",
  },
  {
    id: "kb_003",
    name: "销售数据表",
    description: "2025年Q4销售数据统计表格",
    icon: "📊",
    fileType: "table",
    fileCount: 1,
    charCount: 5200,
    chunkCount: 12,
    status: "active",
    tags: [],
    createdAt: "2025-12-22T14:00:00.000Z",
    updatedAt: "2025-12-22T14:00:00.000Z",
  },
];

/**
 * 预置文档列表
 */
export const MOCK_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: "doc_001",
    knowledgeBaseId: "kb_001",
    name: "产品功能介绍.pdf",
    size: 1024000,
    type: "application/pdf",
    charCount: 8500,
    chunkCount: 18,
    status: "completed",
    uploadedAt: "2025-12-20T10:30:00.000Z",
    parsedAt: "2025-12-20T10:35:00.000Z",
  },
  {
    id: "doc_002",
    knowledgeBaseId: "kb_001",
    name: "常见问题FAQ.docx",
    size: 512000,
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    charCount: 7180,
    chunkCount: 14,
    status: "completed",
    uploadedAt: "2025-12-21T09:00:00.000Z",
    parsedAt: "2025-12-21T09:05:00.000Z",
  },
  {
    id: "doc_003",
    knowledgeBaseId: "kb_002",
    name: "API接口文档.md",
    size: 256000,
    type: "text/markdown",
    charCount: 12000,
    chunkCount: 25,
    status: "completed",
    uploadedAt: "2025-12-18T09:30:00.000Z",
    parsedAt: "2025-12-18T09:32:00.000Z",
  },
];

/**
 * Mock 文档原文内容
 */
const MOCK_DOCUMENT_CONTENT = `# 产品功能介绍
  
  ## 第一章 产品概述
  
  ### 1.1 产品简介
  
  本产品是一款智能客服系统，旨在帮助企业提升客户服务效率。通过先进的自然语言处理技术，系统能够自动理解客户问题并提供准确的回答。
  
  主要特点：
  - 7x24小时全天候服务
  - 支持多渠道接入（网页、APP、微信）
  - 智能语义理解，准确率高达95%
  - 支持人机协作，复杂问题自动转人工
  
  ### 1.2 适用场景
  
  本产品适用于以下场景：
  1. 电商平台客户咨询
  2. 金融机构业务办理
  3. 企业内部IT支持
  4. 政务服务热线
  
  ## 第二章 核心功能
  
  ### 2.1 智能问答
  
  系统基于大语言模型，能够理解用户的自然语言提问，并从知识库中检索相关内容，生成准确、自然的回答。
  
  支持的问题类型：
  - 产品咨询：价格、功能、规格等
  - 售后服务：退换货、维修、投诉等
  - 使用指导：操作步骤、功能说明等
  - 账户相关：注册、登录、密码找回等
  
  ### 2.2 知识库管理
  
  知识库是智能客服的核心，系统提供完善的知识库管理功能：
  
  1. **文档导入**：支持 PDF、Word、TXT 等格式
  2. **智能切片**：自动将文档切分为语义完整的片段
  3. **向量检索**：基于语义相似度的高效检索
  4. **知识更新**：支持增量更新，无需重建索引
  
  ### 2.3 会话管理
  
  系统记录所有客户会话，提供：
  - 会话历史查询
  - 客户画像分析
  - 服务质量评估
  - 热点问题统计
  
  ## 第三章 价格方案
  
  ### 3.1 基础版
  
  价格：￥999/月
  
  包含功能：
  - 5个客服坐席
  - 10万次对话/月
  - 基础知识库（100MB）
  - 标准技术支持
  
  ### 3.2 专业版
  
  价格：￥2999/月
  
  包含功能：
  - 20个客服坐席
  - 50万次对话/月
  - 高级知识库（1GB）
  - 优先技术支持
  - 数据分析报表
  - API接口调用
  
  ### 3.3 企业版
  
  价格：联系销售
  
  包含功能：
  - 无限客服坐席
  - 无限对话次数
  - 专属知识库
  - 7x24技术支持
  - 定制化开发
  - 私有化部署
  
  ## 第四章 快速开始
  
  ### 4.1 注册账号
  
  1. 访问官网 www.example.com
  2. 点击"免费试用"按钮
  3. 填写企业信息
  4. 验证邮箱
  5. 完成注册
  
  ### 4.2 创建知识库
  
  1. 登录管理后台
  2. 进入"知识库"模块
  3. 点击"创建知识库"
  4. 上传文档
  5. 等待系统自动处理
  
  ### 4.3 配置机器人
  
  1. 进入"机器人"模块
  2. 选择绑定的知识库
  3. 设置欢迎语
  4. 配置转人工规则
  5. 发布上线
  `;

/**
 * Mock 章节目录
 */
const MOCK_CHAPTERS: DocumentChapter[] = [
  {
    id: "ch_1",
    title: "产品功能介绍",
    level: 1,
    startIndex: 0,
    endIndex: 2850,
    children: [
      {
        id: "ch_1_1",
        title: "第一章 产品概述",
        level: 2,
        startIndex: 20,
        endIndex: 580,
        children: [
          {
            id: "ch_1_1_1",
            title: "1.1 产品简介",
            level: 3,
            startIndex: 42,
            endIndex: 320,
          },
          {
            id: "ch_1_1_2",
            title: "1.2 适用场景",
            level: 3,
            startIndex: 322,
            endIndex: 580,
          },
        ],
      },
      {
        id: "ch_1_2",
        title: "第二章 核心功能",
        level: 2,
        startIndex: 582,
        endIndex: 1450,
        children: [
          {
            id: "ch_1_2_1",
            title: "2.1 智能问答",
            level: 3,
            startIndex: 605,
            endIndex: 920,
          },
          {
            id: "ch_1_2_2",
            title: "2.2 知识库管理",
            level: 3,
            startIndex: 922,
            endIndex: 1250,
          },
          {
            id: "ch_1_2_3",
            title: "2.3 会话管理",
            level: 3,
            startIndex: 1252,
            endIndex: 1450,
          },
        ],
      },
      {
        id: "ch_1_3",
        title: "第三章 价格方案",
        level: 2,
        startIndex: 1452,
        endIndex: 2100,
        children: [
          {
            id: "ch_1_3_1",
            title: "3.1 基础版",
            level: 3,
            startIndex: 1475,
            endIndex: 1650,
          },
          {
            id: "ch_1_3_2",
            title: "3.2 专业版",
            level: 3,
            startIndex: 1652,
            endIndex: 1880,
          },
          {
            id: "ch_1_3_3",
            title: "3.3 企业版",
            level: 3,
            startIndex: 1882,
            endIndex: 2100,
          },
        ],
      },
      {
        id: "ch_1_4",
        title: "第四章 快速开始",
        level: 2,
        startIndex: 2102,
        endIndex: 2850,
        children: [
          {
            id: "ch_1_4_1",
            title: "4.1 注册账号",
            level: 3,
            startIndex: 2125,
            endIndex: 2380,
          },
          {
            id: "ch_1_4_2",
            title: "4.2 创建知识库",
            level: 3,
            startIndex: 2382,
            endIndex: 2600,
          },
          {
            id: "ch_1_4_3",
            title: "4.3 配置机器人",
            level: 3,
            startIndex: 2602,
            endIndex: 2850,
          },
        ],
      },
    ],
  },
];

/**
 * Mock 切片数据
 */
const DEMO_MARKDOWN = `这里是一段支持 **Markdown** 的内容示例。
  
  ![示例图片](/knowledge/chunk-demo.svg)
  
  | 指标 | 数值 |
  | --- | --- |
  | 召回率 | 0.92 |
  | 精准率 | 0.88 |
  
  内联公式：$E=mc^2$
  
  块级公式：
  $$
  \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
  $$
  `;

const MOCK_CHUNKS: DocumentChunk[] = [
  {
    id: "chunk_001",
    documentId: "doc_001",
    content: DEMO_MARKDOWN,
    charCount: DEMO_MARKDOWN.length,
    index: 1,
    chapterId: "ch_1_1_1",
    startIndex: 42,
    endIndex: 228,
  },
  {
    id: "chunk_002",
    documentId: "doc_001",
    content:
      "本产品适用于以下场景：1. 电商平台客户咨询 2. 金融机构业务办理 3. 企业内部IT支持 4. 政务服务热线",
    charCount: 78,
    index: 2,
    chapterId: "ch_1_1_2",
    startIndex: 229,
    endIndex: 400,
  },
  {
    id: "chunk_003",
    documentId: "doc_001",
    content:
      "系统基于大语言模型，能够理解用户的自然语言提问，并从知识库中检索相关内容，生成准确、自然的回答。支持的问题类型：产品咨询（价格、功能、规格等）、售后服务（退换货、维修、投诉等）、使用指导（操作步骤、功能说明等）、账户相关（注册、登录、密码找回等）。",
    charCount: 156,
    index: 3,
    chapterId: "ch_1_2_1",
    startIndex: 401,
    endIndex: 761,
  },
  {
    id: "chunk_004",
    documentId: "doc_001",
    content:
      "知识库是智能客服的核心，系统提供完善的知识库管理功能：1. 文档导入：支持 PDF、Word、TXT 等格式 2. 智能切片：自动将文档切分为语义完整的片段 3. 向量检索：基于语义相似度的高效检索 4. 知识更新：支持增量更新，无需重建索引",
    charCount: 142,
    index: 4,
    chapterId: "ch_1_2_2",
    startIndex: 922,
    endIndex: 1064,
  },
  {
    id: "chunk_005",
    documentId: "doc_001",
    content:
      "系统记录所有客户会话，提供：会话历史查询、客户画像分析、服务质量评估、热点问题统计",
    charCount: 56,
    index: 5,
    chapterId: "ch_1_2_3",
    startIndex: 1252,
    endIndex: 1308,
  },
  {
    id: "chunk_006",
    documentId: "doc_001",
    content:
      "基础版价格：￥999/月。包含功能：5个客服坐席、10万次对话/月、基础知识库（100MB）、标准技术支持",
    charCount: 68,
    index: 6,
    chapterId: "ch_1_3_1",
    startIndex: 1475,
    endIndex: 1543,
  },
  {
    id: "chunk_007",
    documentId: "doc_001",
    content:
      "专业版价格：￥2999/月。包含功能：20个客服坐席、50万次对话/月、高级知识库（1GB）、优先技术支持、数据分析报表、API接口调用",
    charCount: 86,
    index: 7,
    chapterId: "ch_1_3_2",
    startIndex: 1652,
    endIndex: 1738,
  },
  {
    id: "chunk_008",
    documentId: "doc_001",
    content:
      "企业版价格：联系销售。包含功能：无限客服坐席、无限对话次数、专属知识库、7x24技术支持、定制化开发、私有化部署",
    charCount: 72,
    index: 8,
    chapterId: "ch_1_3_3",
    startIndex: 1882,
    endIndex: 1954,
  },
  {
    id: "chunk_009",
    documentId: "doc_001",
    content:
      '注册账号步骤：1. 访问官网 www.example.com 2. 点击"免费试用"按钮 3. 填写企业信息 4. 验证邮箱 5. 完成注册',
    charCount: 82,
    index: 9,
    chapterId: "ch_1_4_1",
    startIndex: 2125,
    endIndex: 2207,
  },
  {
    id: "chunk_010",
    documentId: "doc_001",
    content:
      '创建知识库步骤：1. 登录管理后台 2. 进入"知识库"模块 3. 点击"创建知识库" 4. 上传文档 5. 等待系统自动处理',
    charCount: 78,
    index: 10,
    chapterId: "ch_1_4_2",
    startIndex: 2382,
    endIndex: 2460,
  },
];

/**
 * 生成 Mock 文档详情（用于没有真实解析时的演示）
 */
export const createMockDocumentDetail = (
  document: KnowledgeDocument,
): DocumentDetail => {
  const chunks = MOCK_CHUNKS.map((chunk, index) => ({
    ...chunk,
    id: `${document.id}_chunk_${index + 1}`,
    documentId: document.id,
    index: index + 1,
  }));

  return {
    document,
    content: MOCK_DOCUMENT_CONTENT,
    chapters: MOCK_CHAPTERS,
    chunks,
  };
};

/**
 * 获取 Mock 文档详情
 */
export const getMockDocumentDetail = (
  documentId: string,
): DocumentDetail | null => {
  if (documentId === "doc_001") {
    return createMockDocumentDetail(MOCK_DOCUMENTS[0]);
  }
  return null;
};

/**
 * 初始化 Mock 数据到 localStorage
 */
export const initMockData = (): void => {
  if (typeof window === "undefined") return;

  // 检查是否已初始化
  const initialized = localStorage.getItem("knowledge_mock_initialized");
  if (initialized) return;

  // 保存知识库
  localStorage.setItem("knowledge_bases", JSON.stringify(MOCK_KNOWLEDGE_BASES));

  // 保存文档
  localStorage.setItem("knowledge_documents", JSON.stringify(MOCK_DOCUMENTS));

  // 保存标签
  localStorage.setItem("knowledge_tags", JSON.stringify(MOCK_TAGS));

  // 保存文档详情
  const detail = getMockDocumentDetail("doc_001");
  if (detail) {
    localStorage.setItem("document_detail_doc_001", JSON.stringify(detail));
  }

  // 标记已初始化
  localStorage.setItem("knowledge_mock_initialized", "true");
};
