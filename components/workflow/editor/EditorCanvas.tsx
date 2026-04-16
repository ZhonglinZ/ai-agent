import { ReactFlowProvider } from "@xyflow/react";
import CanvasContent from "./CanvasContent";

/**
 * 工作流编辑器画布区域
 * 使用 ReactFlow 实现节点拖拽和连线功能
 */
export const EditorCanvas: React.FC = () => {
  return (
    <div className="flex-1 h-full overflow-hidden">
      <ReactFlowProvider>
        <CanvasContent />
      </ReactFlowProvider>
    </div>
  );
};
