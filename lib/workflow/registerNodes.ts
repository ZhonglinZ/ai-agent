import React from 'react';
import { CodeOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { nodeRegistry } from './nodeRegistry';
import { NodeType } from './types';
import type { StartNodeData, EndNodeData, CodeNodeData } from './types';
import { StartNode } from '@/components/workflow/nodes/StartNode';
import { EndNode } from '@/components/workflow/nodes/EndNode';
import { CodeNode } from '@/components/workflow/nodes/CodeNode';
import { StartPropertyPanel } from '@/components/workflow/panels/StartNodePropertyPanel';
import { EndPropertyPanel } from '@/components/workflow/panels/EndNodePropertyPanel';

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