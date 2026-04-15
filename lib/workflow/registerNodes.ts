import React from 'react';
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { nodeRegistry } from './nodeRegistry';
import { NodeType } from './types';
import type { StartNodeData, EndNodeData } from './types';
import { StartNode } from '@/components/workflow/nodes/StartNode';
import { EndNode } from '@/components/workflow/nodes/EndNode';

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
    formSchema: [
    {
      name: 'label',
      label: '节点名称',
      type: 'input',
      required: true,
      placeholder: '请输入节点名称',
    },
    {
      name: 'triggerType',
      label: '触发方式',
      type: 'select',
      required: true,
      options: [
        { label: '手动触发', value: 'manual' },
        { label: '定时触发', value: 'schedule' },
        { label: 'Webhook 触发', value: 'webhook' },
      ],
      tooltip: '选择工作流的触发方式',
    },
  ],
    propertyPanel: undefined,  // 后续实现
    maxInputs: 0,
    maxOutputs: 1,
    defaultData: {
      label: '开始',
      triggerType: 'manual',
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
    propertyPanel: undefined,
    maxInputs: 1,
    maxOutputs: 0,
    defaultData: {
      label: '结束',
      endStatus: 'success',
    },
    formSchema: [
    {
      name: 'label',
      label: '节点名称',
      type: 'input',
      required: true,
      placeholder: '请输入节点名称',
    },
    {
      name: 'endStatus',
      label: '结束状态',
      type: 'radio',
      required: true,
      options: [
        { label: '成功', value: 'success' },
        { label: '失败', value: 'failure' },
      ],
      tooltip: '工作流结束时的状态',
    },
  ],
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