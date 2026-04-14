import { create } from 'zustand';
import type { Workflow } from '@/lib/types/workflow';

interface WorkflowState {
  // ==================== 基础数据 ====================
  /** 当前工作流数据，null 表示尚未加载或不存在 */
  workflow: Workflow | null;
  /** 是否正在加载，用于显示 loading 状态 */
  isLoading: boolean;
  /** 是否有未保存的修改，用于离开页面时提示用户 */
  isDirty: boolean;

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