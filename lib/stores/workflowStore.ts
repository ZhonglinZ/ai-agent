import { create } from 'zustand';
import type { Workflow } from '@/lib/types/workflow';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import { nodeRegistry} from '@/lib/workflow/nodeRegistry';
import type { WorkflowNode, WorkflowEdge, WorkflowNodeData,NodeType  } from '@/lib/workflow/types';
import { generateNodeId } from '../utils';

interface WorkflowState {
  // ==================== 基础数据 ====================
  /** 当前工作流数据，null 表示尚未加载或不存在 */
  workflow: Workflow | null;
  /** 是否正在加载，用于显示 loading 状态 */
  isLoading: boolean;
  /** 是否有未保存的修改，用于离开页面时提示用户 */
  isDirty: boolean;
  nodes: WorkflowNode[];
  /** 画布中的所有边（连线） */
  edges: WorkflowEdge[];
  /** 当前选中的节点 ID */
  selectedNodeId: string | null;

  // ==================== Actions ====================
  /** 设置工作流数据（通常在初始加载时调用） */
  setWorkflow: (workflow: Workflow | null) => void;
  /** 更新工作流部分字段（编辑时调用，会自动标记 isDirty） */
  updateWorkflow: (updates: Partial<Workflow>) => void;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /** 设置是否有修改 */
  setDirty: (dirty: boolean) => void;
  /** 重置状态（离开页面时调用，清理数据） */
  reset: () => void;
  /** 设置节点列表 */
  setNodes: (nodes: WorkflowNode[]) => void;
  /** 设置边列表 */
  setEdges: (edges: WorkflowEdge[]) => void;
    /**
   * 处理节点变化
   *
   * ReactFlow 会在以下情况触发 onNodesChange：
   * - 节点被拖动（position 变化）
   * - 节点被选中/取消选中（selected 变化）
   * - 节点被删除（remove 变化）
   *
   * applyNodeChanges 是 ReactFlow 提供的工具函数，
   * 它会根据 changes 数组更新 nodes 数组
   */
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;

  /**
   * 处理边变化
   * 类似 onNodesChange，处理边的增删改
   */
  onEdgesChange: (changes: EdgeChange<WorkflowEdge>[]) => void;

  /**
   * 处理连接事件
   * 当用户从一个节点的输出拖到另一个节点的输入时触发
   *
   * addEdge 是 ReactFlow 提供的工具函数，
   * 它会创建一条新边并添加到 edges 数组
   */
  onConnect: (connection: Connection) => void;

    /**
   * 添加新节点
   *
   * @param type 节点类型
   * @param position 节点位置
   */
  addNode: (type: NodeType, position: { x: number; y: number }) => void;

  /**
   * 更新节点数据
   * 用于属性面板修改节点配置时
   */
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;

  /**
   * 删除节点
   */
  deleteNode: (nodeId: string) => void;

  /**
   * 设置选中的节点
   */
  setSelectedNodeId: (nodeId: string | null) => void;
}

/**
 * 初始状态
 * 将初始状态提取为常量，方便在 reset 时复用
 */
const initialState = {
  workflow: null,
  isLoading: true,  // 默认为 true，因为页面加载时需要请求数据
  isDirty: false,
};

/**
 * 工作流编辑器 Store
 */
export const useWorkflowStore = create<WorkflowState>((set) => ({
  // 展开初始状态
  ...initialState,
  nodes: [] as WorkflowNode[],
  edges: [] as WorkflowEdge[],
  selectedNodeId: null,

  setNodes: (nodes: WorkflowNode[]) => set({ nodes }),
  setEdges: (edges: WorkflowEdge[]) => set({ edges }),

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges),
    }));
  },

  addNode: (type, position) => {
    const defaultData = nodeRegistry.getDefaultData(type);
    if (!defaultData) {
      console.error(`未找到节点类型 ${type} 的默认数据`);
      return;
    }

    const newNode: WorkflowNode = {
      id: generateNodeId(),
      type,
      position,
      data: { ...defaultData },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
  },

  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    }));
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      // 同时删除与该节点相关的边
      edges: state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
    }));
  },

  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
  // 设置工作流数据，同时将 isLoading 设为 false
  // 这是一个常见的模式：数据加载完成后自动关闭 loading
  setWorkflow: (workflow) => set({ workflow, isLoading: false }),

  // 更新工作流部分字段
  // 使用函数形式的 set，可以访问当前状态
  updateWorkflow: (updates) =>
    set((state) => ({
      // 只有 workflow 存在时才更新，避免空指针
      workflow: state.workflow ? { ...state.workflow, ...updates } : null,
      // 有修改就标记为 dirty
      isDirty: true,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setDirty: (isDirty) => set({ isDirty }),

  // 重置为初始状态，在组件卸载时调用
  reset: () => set(initialState),

}));