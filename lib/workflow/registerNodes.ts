import React from 'react';
import { ApiOutlined, CodeOutlined, PlayCircleOutlined, RobotOutlined, StopOutlined } from '@ant-design/icons';
import { nodeRegistry } from './nodeRegistry';
import { NodeType } from './types';
import type { StartNodeData, EndNodeData, CodeNodeData, LLMNodeData, APINodeData } from './types';
import { StartNode } from '@/components/workflow/nodes/StartNode';
import { EndNode } from '@/components/workflow/nodes/EndNode';
import { CodeNode } from '@/components/workflow/nodes/CodeNode';
import { StartPropertyPanel } from '@/components/workflow/panels/StartNodePropertyPanel';
import { EndPropertyPanel } from '@/components/workflow/panels/EndNodePropertyPanel';
import { LLMNode } from '@/components/workflow/nodes';
import { LLMPropertyPanel } from '@/components/workflow/panels';
import { APINode } from '@/components/workflow/nodes/APINode';
import { APIPropertyPanel } from '@/components/workflow/panels/apiPanel';

/**
 * 注册所有节点类型
 */
export function registerAllNodes(): void {
  // 注册开始节点
  nodeRegistry.register<StartNodeData>({
    type: NodeType.START,
    label: '开始',
    description: '工作流的起点，定义触发方式',
    icon: React.createElement(PlayCircleOutlined),
    category: 'trigger',
    component: StartNode,
    propertyPanel: StartPropertyPanel,
    maxInputs: 0,
    maxOutputs: 1,
    defaultData: {
      label: '开始',
      triggerType: 'manual',
      inputs: [],
    },
  });

  // 注册结束节点
  nodeRegistry.register<EndNodeData>({
    type: NodeType.END,
    label: '结束',
    description: '工作流的终点',
    icon: React.createElement(StopOutlined),
    category: 'end',
    component: EndNode,
    propertyPanel: EndPropertyPanel,
    maxInputs: 1,
    maxOutputs: 0,
    defaultData: {
      label: '结束',
      endStatus: 'success',
      outputVariables: [],
    },
  });

  nodeRegistry.register<CodeNodeData>({
  type: NodeType.CODE,
  label: '代码',
  description: '执行自定义 JavaScript 或 Python 代码',
  icon: React.createElement(CodeOutlined),
  category: 'action',
  component: CodeNode,
  formSchema: [
    {
      name: 'label',
      label: '节点名称',
      type: 'input',
      required: true,
    },
    {
      name: 'language',
      label: '编程语言',
      type: 'select',
      required: true,
      options: [
        { label: 'JavaScript', value: 'javascript' },
        { label: 'Python', value: 'python' },
      ],
    },
    {
      name: 'code',
      label: '代码',
      type: 'textarea',
      placeholder: '请输入代码',
    },
  ],
  maxInputs: 1,
  maxOutputs: 1,
  defaultData: {
    label: '代码',
    language: 'javascript',
    code: '// 在这里编写代码\nreturn { result: "Hello World" };',
    outputs:[]
  },
});

// ==================== 注册大模型节点 ====================
nodeRegistry.register<LLMNodeData>({
  type: NodeType.LLM,
  label: '大模型',
  description: '调用大语言模型（LLM）生成内容',
  icon: React.createElement(RobotOutlined),
  iconColor: 'blue',
  category: 'action',
  component: LLMNode,
  // 使用自定义属性面板（复杂表单）
  propertyPanel: LLMPropertyPanel,
  maxInputs: 1,
  maxOutputs: 1,
  defaultData: {
    label: '大模型',
    model: undefined,           // 默认未选择模型
    temperatureEnabled: true,   // 默认启用温度参数
    temperature: 0.6,           // 默认温度
    topPEnabled: false,         // 默认不启用 Top P
    topP: 0.8,                  // 默认 Top P 值
    context: '',                // 上下文变量
    prompt: '',                 // 提示词
    outputs: [                  // 默认输出变量
      {
        id: 'llm_output',
        name: 'text',
        type: 'string',
        description: '生成内容',
      },
    ],
  },
});

// ==================== 注册 API 节点 ====================
nodeRegistry.register<APINodeData>({
  type: NodeType.API,
  label: 'API',
  description: '发送 HTTP 请求，支持 GET/POST/PUT/DELETE/PATCH',
  icon: React.createElement(ApiOutlined),
  iconColor: 'green',
  category: 'action',
  component: APINode,
  propertyPanel: APIPropertyPanel,
  maxInputs: 1,
  maxOutputs: 1,
  defaultData: {
    label: 'API',
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    authEnabled: false,
    bodyType: 'none',
    bodyFormData: [],
    bodyJson: '',
    bodyRaw: '',
    timeout: 120,
    retryCount: 3,
    outputs: [
      { id: 'body', name: 'body', type: 'string', description: '响应内容' },
      { id: 'status_code', name: 'status_code', type: 'number', description: '响应状态码' },
      { id: 'headers', name: 'headers', type: 'object', description: '响应头列表 JSON' },
    ],
  },
});
}

/**
 * 初始化节点注册表
 * 使用标志位确保只注册一次
 */
let isRegistered = false;

export function initializeNodeRegistry(): void {
  if (isRegistered) return;
  registerAllNodes();
  isRegistered = true;
}