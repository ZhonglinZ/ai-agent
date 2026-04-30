import { create } from "zustand";
import { temporal } from "zundo";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import type { Workflow } from "@/lib/types/workflow";
import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeData,
} from "@/lib/workflow/types";
import { NodeType } from "@/lib/workflow/types";
import { nodeRegistry } from "@/lib/workflow/nodeRegistry";
/**
 * 工作流编辑器状态接口
 * 管理工作流的基本信息、画布节点和编辑状态
 */
interface WorkflowState {
  // ==================== 基础数据 ====================
  /** 当前工作流数据 */
  workflow: Workflow | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否有未保存的修改 */
  isDirty: boolean;

  // ==================== 画布数据 ====================
  /** 画布中的节点列表 */
  nodes: WorkflowNode[];
  /** 画布中的边（连线）列表 */
  edges: WorkflowEdge[];
  /** 当前选中的节点 ID */
  selectedNodeId: string | null;

  // ==================== 节点放置模式 ====================
  /** 当前正在放置的节点类型（null 表示不在放置模式） */
  placingNodeType: NodeType | null;

  // ==================== 基础 Actions ====================
  setWorkflow: (workflow: Workflow | null) => void;
  updateWorkflow: (updates: Partial<Workflow>) => void;
  setLoading: (loading: boolean) => void;
  setDirty: (dirty: boolean) => void;
  reset: () => void;

  // ==================== 画布 Actions ====================
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<WorkflowEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNodeId: (nodeId: string | null) => void;

  // ==================== 节点放置 Actions ====================
  startPlacingNode: (type: NodeType) => void;
  cancelPlacingNode: () => void;
}

/**
 * 初始状态
 */
const initialState = {
  workflow: null,
  isLoading: true,
  isDirty: false,
  nodes: [] as WorkflowNode[],
  edges: [] as WorkflowEdge[],
  selectedNodeId: null,
  placingNodeType: null as NodeType | null,
};

/**
 * 生成唯一的节点 ID
 */
const generateNodeId = (): string => {
  return `node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * 工作流编辑器 Store
 * 使用 zustand 管理工作流编辑器的全局状态
 * 使用 zundo 的 temporal 中间件实现撤销/重做功能
 */
export const useWorkflowStore = create<WorkflowState>()(
  temporal(
    (set) => ({
      // 初始状态
      ...initialState,

      // ==================== 基础 Actions ====================

      setWorkflow: (workflow) => set({ workflow, isLoading: false }),

      updateWorkflow: (updates) =>
        set((state) => ({
          workflow: state.workflow ? { ...state.workflow, ...updates } : null,
          isDirty: true,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setDirty: (isDirty) => set({ isDirty }),

      reset: () => set(initialState),

      // ==================== 画布 Actions ====================

      setNodes: (nodes) => set({ nodes }),

      setEdges: (edges) => set({ edges }),

      onNodesChange: (changes) => {
        console.log("=== onNodesChange 节点 触发===");
        set((state) => ({
          nodes: applyNodeChanges(changes, state.nodes),
          isDirty: true,
        }));
      },

      onEdgesChange: (changes) => {
        set((state) => ({
          edges: applyEdgeChanges(changes, state.edges),
          isDirty: true,
        }));
      },

      onConnect: (connection) => {
        set((state) => ({
          edges: addEdge(
            {
              ...connection,
              type: "default",
              animated: false,
            },
            state.edges
          ),
          isDirty: true,
        }));
      },

      addNode: (type, position) => {
        const defaultData = nodeRegistry.getDefaultData(type);
        if (!defaultData) {
          console.error(`节点类型 "${type}" 未注册`);
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
          isDirty: true,
        }));
      },

      updateNodeData: (nodeId, data) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, ...data } }
              : node
          ),
          isDirty: true,
        }));
      },

      deleteNode: (nodeId) => {
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== nodeId),
          edges: state.edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
          selectedNodeId:
            state.selectedNodeId === nodeId ? null : state.selectedNodeId,
          isDirty: true,
        }));
      },

      setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

      // ==================== 节点放置 Actions ====================

      startPlacingNode: (type) => set({ placingNodeType: type }),

      cancelPlacingNode: () => set({ placingNodeType: null }),
    }),
    {
      // 只追踪 nodes 和 edges 的变化（不追踪 UI 状态如 selectedNodeId）
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
      // 在保存状态时，过滤掉节点的 width, height, measured 等属性
      onSave: (state) => ({
        nodes: state.nodes.map(
          ({ width, height, measured, selected, ...rest }) => rest
        ),
        edges: state.edges,
      }),
      // 限制历史记录数量，防止内存占用过大
      limit: 50,
      // 使用浅比较来判断状态是否真的改变了
      equality: (past, present) => {
        return past.nodes === present.nodes && past.edges === present.edges;
      },
    }
  )
);
