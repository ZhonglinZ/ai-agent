/**
 * 工作流节点类型系统
 *
 * 这个文件定义了工作流编辑器中所有节点相关的类型
 */

import type { Node, Edge } from '@xyflow/react';
import type { ReactNode } from 'react';

export enum NodeType {
  START = 'start',
  END = 'end',
  CODE = 'code',
  // ========== 后续扩展 ==========
  // HTTP_REQUEST = 'httpRequest',
  // CONDITION = 'condition',
}

/**
 * 节点分类
 * 用于在左侧节点面板中对节点进行分组显示
 */
export type NodeCategory =
  | 'trigger'    // 触发器：开始节点等
  | 'action'     // 动作：HTTP请求、发送邮件等
  | 'logic'      // 逻辑：条件判断、循环等
  | 'transform'  // 转换：数据处理、格式转换等
  | 'end';       // 结束：结束节点

/**
 * 分类中文名映射
 */
export const categoryLabels: Record<NodeCategory, string> = {
  trigger: '触发器',
  action: '动作',
  logic: '逻辑控制',
  transform: '数据转换',
  end: '结束',
};

/**
 * 基础节点数据
 * 所有节点都会有的通用字段
 *
 * 注意：添加索引签名以兼容 ReactFlow 的 Record<string, unknown> 要求
 */
export interface BaseNodeData {
  /** 节点标签/名称 */
  label: string;
  /** 节点描述（可选） */
  description?: string;
  /** 索引签名，允许额外的属性 */
  [key: string]: unknown;
}

/**
 * 开始节点数据
 */
export interface StartNodeData extends BaseNodeData {
  /** 触发方式：manual-手动触发，schedule-定时触发，webhook-Webhook触发 */
  triggerType: 'manual' | 'schedule' | 'webhook';
}

/**
 * 结束节点数据
 */
export interface EndNodeData extends BaseNodeData {
  /** 结束状态：success-成功，failure-失败 */
  endStatus: 'success' | 'failure';
}

/**
 * 代码节点数据
 */
export interface CodeNodeData extends BaseNodeData {
  language: 'javascript' | 'python' ;
  code: string;
}
/**
 * 所有节点数据的联合类型
 * 添加新节点时，需要在这里添加对应的数据类型
 */
export type WorkflowNodeData = StartNodeData | EndNodeData | CodeNodeData;

/**
 * 工作流节点类型
 * 继承自 ReactFlow 的 Node 类型，并指定我们的 data 类型
 */
export type WorkflowNode = Node<WorkflowNodeData, NodeType>;

/**
 * 工作流边类型
 * 暂时使用 ReactFlow 默认的 Edge 类型
 */
export type WorkflowEdge = Edge;

/**
 * 节点配置接口
 *
 * 每种节点类型都需要提供一个配置对象，包含：
 * - 基本信息（类型、名称、图标、分类）
 * - 组件（节点组件、属性面板组件）
 * - 连接规则（最大输入/输出数量）
 * - 默认数据
 */
export interface NodeConfig<T extends WorkflowNodeData = WorkflowNodeData> {
  /** 节点类型 */
  type: NodeType;
  /** 节点名称（显示在节点面板中） */
  label: string;
  /** 节点描述 */
  description: string;
  /** 节点图标 */
  icon: ReactNode;
  /** 节点分类 */
  category: NodeCategory;

  /** 节点组件 */
  component: React.ComponentType<{ data: T; id: string; selected?: boolean }>;
   /**
   * 属性面板配置（二选一）
   * - formSchema: 简单表单使用配置驱动
   * - propertyPanel: 复杂表单使用自定义组件
   *
   * 优先级：propertyPanel > formSchema
   */
  formSchema?: FormField[];
  /** 自定义属性面板组件 */
  propertyPanel?: React.ComponentType<PropertyPanelProps<T>>;
  /** 最大输入连接数，0 表示不限制 */
  maxInputs: number;
  /** 最大输出连接数，0 表示不限制 */
  maxOutputs: number;

  /** 默认数据 */
  defaultData: T;
}

/**
 * 表单字段类型
 * 用于动态表单渲染
 */
export type FormFieldType =
  | 'input'      // 单行文本
  | 'textarea'   // 多行文本
  | 'select'     // 下拉选择
  | 'switch'     // 开关
  | 'number'     // 数字输入
  | 'radio'      // 单选
  | 'checkbox';  // 多选

  /**
 * 表单字段选项（用于 select、radio、checkbox）
 */
export interface FormFieldOption {
  label: string;
  value: string | number | boolean;
}

/**
 * 表单字段配置
 * 用于配置驱动的动态表单渲染
 */
export interface FormField {
  /** 字段名（对应节点数据中的 key） */
  name: string;
  /** 字段标签 */
  label: string;
  /** 字段类型 */
  type: FormFieldType;
  /** 是否必填 */
  required?: boolean;
  /** 占位文本 */
  placeholder?: string;
  /** 选项（用于 select、radio、checkbox） */
  options?: FormFieldOption[];
  /** 默认值 */
  defaultValue?: unknown;
  /** 提示信息（显示为问号图标） */
  tooltip?: string;
  /** 字段描述（显示在输入框下方） */
  description?: string;
}

/**
 * 属性面板组件的 Props
 */
export interface PropertyPanelProps<T extends WorkflowNodeData = WorkflowNodeData> {
  /** 节点 ID */
  nodeId: string;
  /** 节点数据 */
  data: T;
}

