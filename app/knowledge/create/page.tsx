/**
 * 创建知识库页面
 */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Form,
  Input,
  Button,
  Card,
  Segmented,
  Upload,
  message,
  Space,
  Typography,
  Divider,
  Tooltip,
} from "antd";
import {
  InboxOutlined,
  FileTextOutlined,
  TableOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import { MainLayout } from "@/components/layouts/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { knowledgeService } from "@/lib/services/knowledgeNew.service";
import { createMockDocumentDetail } from "@/lib/services/knowledge.mock";
import type {
  FileDataType,
  ParseStrategy,
  ChunkStrategy,
  CreateKnowledgeBaseRequest,
} from "@/lib/types/knowledge";

const { TextArea } = Input;
const { Dragger } = Upload;
const { Text } = Typography;

// 图标选项
const ICON_OPTIONS = ["📚", "📘", "📂", "🗃️", "💼", "🔧", "⚙️", "📊"];

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("读文件失败"));
    reader.readAsText(file);
  });
}

// 解析策略选项
const PARSE_STRATEGIES: {
  value: ParseStrategy;
  label: string;
  description: string;
}[] = [
  { value: "text", label: "文字识别", description: "基于规则的文档提取" },
  // {
  //   value: "ocr",
  //   label: "图片文字识别(OCR)",
  //   description: "解析图片、扫描件中的文字信息",
  // },
  // {
  //   value: "table",
  //   label: "表格解析",
  //   description: "保留文内表格中的结构化信息",
  // },
  // {
  //   value: "image",
  //   label: "图片提取",
  //   description: "识别并提取原文档中的图片",
  // },
];

// 切片策略选项
const CHUNK_STRATEGIES: {
  value: ChunkStrategy;
  label: string;
  description: string;
}[] = [
  { value: "auto", label: "自动切片", description: "通用格式文本常见切分方法" },
  // {
  //   value: "delimiter",
  //   label: "按常见标识符切分",
  //   description: "配置常见的标识符、切片最大长度等选项",
  // },
  // { value: "page", label: "按页切分", description: "适用于PPT、单页图标等" },
  // {
  //   value: "regex",
  //   label: "自定义正则切分",
  //   description: "通过正则表达式，自定义匹配切片分隔符",
  // },
  // {
  //   value: "hierarchy",
  //   label: "按层级切分",
  //   description: "根据文档中的标题层级结构，智能切分内容片段",
  // },
];

export default function CreateKnowledgePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileType, setFileType] = useState<FileDataType>("text");
  const [selectedIcon, setSelectedIcon] = useState("📚");
  const [parseStrategy, setParseStrategy] = useState<ParseStrategy>("text");
  const [chunkStrategy, setChunkStrategy] = useState<ChunkStrategy>("auto");
  const [fileList, setFileList] = useState<any[]>([]);

  // 提交表单
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const request: CreateKnowledgeBaseRequest = {
        name: values.name,
        description: values.description || "",
        icon: selectedIcon,
        fileType,
        config: {
          parseStrategy,
          chunkStrategy,
          chunkSize: 500,
          chunkOverlap: 50,
        },
        tags: [],
      };

      const { knowledgeBaseId } =
        await knowledgeService.createKnowledgeBase(request);
      // 模拟文件上传与解析
      if (fileList.length > 0) {
        for (const item of fileList) {
          const file: File = item.originFileObj ?? item;
          // 前端再拦一层扩展名
          const name = file.name.toLowerCase();
          if (!name.endsWith(".txt") && !name.endsWith(".md")) {
            message.warning(`${file.name} 已跳过（仅支持 txt/md）`);
            continue;
          }
          const content = await readFileAsText(file);
          if (!content.trim()) {
            message.warning(`${file.name} 内容为空，已跳过`);
            continue;
          }
          // 后端 ingest 只要 name + content 即可；size/type 可选
          await knowledgeService.addDocument(knowledgeBaseId, {
            size: file.size,
            type: file.type,
            name: file.name,
            content,
          });
        }
      }

      message.open({
        type: "success",
        content: "创建成功",
        duration: 2,
      });
      router.push(`/knowledge/${knowledgeBaseId}`);
    } catch (error) {
      message.error(`创建失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 上传配置
  const uploadProps: UploadProps = {
    name: "file",
    multiple: true,
    accept: ".txt,.md",
    fileList,
    beforeUpload: (file) => {
      // 检查文件大小（最大 200MB）
      if (file.size > 200 * 1024 * 1024) {
        message.error(`${file.name} 文件大小超过 200MB 限制`);
        return Upload.LIST_IGNORE;
      }
      setFileList((prev) => [...prev, file]);
      return false; // 阻止自动上传
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    },
  };

  return (
    <MainLayout>
      <div className="max-w-4xl">
        <PageHeader
          title="创建知识库"
          subtitle="创建一个新的知识库，上传文档并配置切片策略"
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: "",
            description: "",
          }}
        >
          {/* 基本信息 */}
          <Card title="基本信息" className="mb-6">
            <Form.Item
              name="name"
              label="知识库名称"
              rules={[
                { required: true, message: "请输入知识库名称" },
                { max: 20, message: "名称不能超过 20 个字符" },
                {
                  pattern:
                    /^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5_\-\.]*$/,
                  message:
                    "只能输入字母、中文、数字、下划线、中划线、点，并且必须以字母或中文开头",
                },
              ]}
              extra="支持50位字符，只能输入字母、中文、数字、下划线（_）、中划线（-）、点（.），并且必须以字母或中文开头"
            >
              <Input placeholder="请输入知识库名称" maxLength={20} showCount />
            </Form.Item>

            <Form.Item
              name="description"
              label="知识库描述"
              extra="支持 0-200 位字符"
            >
              <TextArea
                placeholder="请输入知识库内容备注说明，便于查找和管理知识库。描述不影响Agent对知识库的调用效果"
                maxLength={200}
                showCount
                rows={3}
              />
            </Form.Item>

            <Form.Item label="图标">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: "#f0f0ff" }}
                >
                  {selectedIcon}
                </div>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <Button
                      key={icon}
                      type={selectedIcon === icon ? "primary" : "default"}
                      onClick={() => setSelectedIcon(icon)}
                      className="w-10 h-10 flex items-center justify-center text-lg"
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>
            </Form.Item>

            <Form.Item label="文件类型" required>
              <Segmented
                value={fileType}
                onChange={(value) => setFileType(value as FileDataType)}
                options={[
                  {
                    value: "text",
                    label: (
                      <div className="flex items-center gap-2 px-2 py-1">
                        <FileTextOutlined />
                        <span>文本型数据</span>
                      </div>
                    ),
                  },
                  // {
                  //   value: "table",
                  //   label: (
                  //     <div className="flex items-center gap-2 px-2 py-1">
                  //       <TableOutlined />
                  //       <span>表格型数据</span>
                  //     </div>
                  //   ),
                  // },
                ]}
              />
            </Form.Item>

            <Form.Item label="文件上传" required>
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">将文件拖拽到此处或点击上传</p>
                <p className="ant-upload-hint">
                  支持上传 .doc .docx .pdf .txt 文件；单次至多上传 20
                  个文件；每个文件不超过 200MB
                </p>
              </Dragger>
            </Form.Item>
          </Card>

          {/* 策略配置 */}
          <Card title="策略配置" className="mb-6">
            <Form.Item
              label={
                <span>
                  解析策略
                  <Tooltip title="选择文档内容的提取方式">
                    <InfoCircleOutlined className="ml-1 text-gray-400" />
                  </Tooltip>
                </span>
              }
              required
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PARSE_STRATEGIES.map((strategy) => (
                  <div
                    key={strategy.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      parseStrategy === strategy.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => setParseStrategy(strategy.value)}
                  >
                    <div className="font-medium text-gray-900">
                      {strategy.label}
                    </div>
                    <Text type="secondary" className="text-xs">
                      {strategy.description}
                    </Text>
                  </div>
                ))}
              </div>
            </Form.Item>

            <Divider />

            <Form.Item
              label={
                <span>
                  切片策略
                  <Tooltip title="选择文档切分为片段的方式">
                    <InfoCircleOutlined className="ml-1 text-gray-400" />
                  </Tooltip>
                </span>
              }
              required
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CHUNK_STRATEGIES.map((strategy) => (
                  <div
                    key={strategy.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      chunkStrategy === strategy.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => setChunkStrategy(strategy.value)}
                  >
                    <div className="font-medium text-gray-900">
                      {strategy.label}
                    </div>
                    <Text type="secondary" className="text-xs">
                      {strategy.description}
                    </Text>
                  </div>
                ))}
              </div>
            </Form.Item>
          </Card>

          {/* 提交按钮 */}
          <div className="flex justify-end gap-3">
            <Button onClick={() => router.back()}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              确定
            </Button>
          </div>
        </Form>
      </div>
    </MainLayout>
  );
}
