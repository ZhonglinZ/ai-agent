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
  SubflowGraph,
} from "@/lib/workflow/types";
import { NodeType } from "@/lib/workflow/types";
import { nodeRegistry } from "@/lib/workflow/nodeRegistry";
import { workflowService } from "../services/workflow.service";
import { createEmptySubflow } from "../workflow/createEmptySubflow";
/**
 * 工作流编辑器状态接口
 * 管理工作流的基本信息、画布节点和编辑状态
 */
interface CanvasFrame {
  loopNodeId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
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

  // [新增] 是否开启防撞功能
  enableCollision: boolean;
  // [新增] 切换开关的方法
  toggleCollision: () => void;

  // ==================== 工作流 Actions ====================
  /** 保存工作流到本地存储 */
  saveWorkflow: () => Promise<boolean>;
  /** 从本地存储加载工作流画布数据 */
  loadWorkflowData: (workflowId: string) => Promise<boolean>;

  // ==================== 画布子图 Actions ====================
  canvasStack: CanvasFrame[]; // [] = 正在看主图
  enterSubflow: (loopNodeId: string) => void;
  exitSubflow: () => void;
  /** 静默把当前子图写回根图并返回根 nodes/edges；不切换当前画面 */
  flushSubflowToRoot: () =>
    | {
        nodes: WorkflowNode[];
        edges: WorkflowEdge[];
      }
    | undefined;
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
  enableCollision: true,
  canvasStack: [] as CanvasFrame[],
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
            state.edges,
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
              ? {
                  ...node,
                  data: { ...node.data, ...data } as WorkflowNodeData,
                }
              : node,
          ),
          isDirty: true,
        }));
      },

      deleteNode: (nodeId) => {
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== nodeId),
          edges: state.edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId,
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

      toggleCollision: () =>
        set((state) => ({ enableCollision: !state.enableCollision })),

      // ==================== 工作流 Actions ====================
      saveWorkflow: async () => {
        const { workflow, flushSubflowToRoot } = useWorkflowStore.getState();

        if (!workflow?.id) {
          console.error("无法保存：工作流 ID 不存在");
          return false;
        }

        try {
          // 人可能还在子图里：先静默写回，再存根图
          const { nodes, edges } = flushSubflowToRoot() || {
            nodes: [],
            edges: [],
          };
          await workflowService.saveWorkflow(
            workflow.id,
            workflow.name,
            nodes,
            edges,
          );

          set({ isDirty: false });
          return true;
        } catch (error) {
          console.error("保存工作流失败:", error);
          return false;
        }
      },

      loadWorkflowData: async (workflowId: string) => {
        try {
          const data = await workflowService.getWorkflowData(workflowId);

          if (data && data.nodes && data.nodes.length > 0) {
            set({
              nodes: data.nodes,
              edges: data.edges || [],
              canvasStack: [],
            });
            return true;
          }

          return false;
        } catch (error) {
          console.error("加载工作流数据失败:", error);
          return false;
        }
      },

      // ==================== 画布子图 Actions ====================
      enterSubflow: (loopNodeId) => {
        const state = useWorkflowStore.getState();
        const { nodes, edges, canvasStack } = state;
        const loopNode = nodes.find((node) => node.id === loopNodeId);
        if (!loopNode || loopNode.type !== NodeType.LOOP) {
          console.error("循环节点不存在或不是循环节点");
          return;
        }
        const nodeSubflow = loopNode.data.subflow as SubflowGraph | undefined;
        const subflow = nodeSubflow?.nodes?.length
          ? nodeSubflow
          : createEmptySubflow();

        set({
          canvasStack: [...canvasStack, { loopNodeId, nodes, edges }],
          nodes: subflow.nodes,
          edges: subflow.edges,
          selectedNodeId: null,
        });

        useWorkflowStore.temporal.getState().clear();
      },

      exitSubflow: () => {
        const state = useWorkflowStore.getState();
        const frame = state.canvasStack.at(-1);
        if (!frame) {
          return;
        }

        // 当前画面是子图，写回父快照里对应的循环节点
        const subflow: SubflowGraph = {
          nodes: state.nodes,
          edges: state.edges,
        };
        const parentNodes = frame.nodes.map((n) =>
          n.id === frame.loopNodeId
            ? {
                ...n,
                data: { ...n.data, subflow } as WorkflowNodeData,
              }
            : n,
        );

        set({
          canvasStack: state.canvasStack.slice(0, -1),
          nodes: parentNodes,
          edges: frame.edges,
          selectedNodeId: frame.loopNodeId,
          isDirty: true,
        });
        useWorkflowStore.temporal.getState().clear();
      },

      flushSubflowToRoot: ():
        | { nodes: WorkflowNode[]; edges: WorkflowEdge[] }
        | undefined => {
        const state = useWorkflowStore.getState();

        // 已在主图：当前就是根图
        if (state.canvasStack.length === 0) {
          return { nodes: state.nodes, edges: state.edges };
        }

        // 从内往外写回；不切换当前画面
        let childNodes = state.nodes;
        let childEdges = state.edges;
        const newStack = state.canvasStack.map((frame) => ({ ...frame }));

        for (let i = newStack.length - 1; i >= 0; i--) {
          const frame = newStack[i];
          const parentNodes = frame.nodes.map((n) =>
            n.id === frame.loopNodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    subflow: { nodes: childNodes, edges: childEdges },
                  } as WorkflowNodeData,
                }
              : n,
          );
          newStack[i] = { ...frame, nodes: parentNodes };
          childNodes = parentNodes;
          childEdges = frame.edges;
        }

        set({ canvasStack: newStack });
        return { nodes: childNodes, edges: childEdges };
      },
    }),
    {
      // 只追踪 nodes 和 edges 的变化（不追踪 UI 状态如 selectedNodeId）
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        enableCollision: state.enableCollision,
      }),
      // 在保存状态时，过滤掉节点的 width, height, measured 等属性
      onSave: (state) => ({
        nodes: state.nodes.map(
          ({ width, height, measured, selected, ...rest }) => rest,
        ),
        edges: state.edges,
      }),
      // 限制历史记录数量，防止内存占用过大
      limit: 50,
      // 使用浅比较来判断状态是否真的改变了
      equality: (past, present) => {
        return past.nodes === present.nodes && past.edges === present.edges;
      },
    },
  ),
);
