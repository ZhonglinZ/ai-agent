import { useWorkflowStore } from "@/lib/stores/workflowStore";
import {
  BranchCondition,
  BranchNodeData,
  PropertyPanelProps,
} from "@/lib/workflow";
import { getAvailableVariables } from "@/lib/workflow/variableUtils";
import { useMemo } from "react";
import BranchEditor from "./BranchEditor";
import { Button, Divider } from "antd";
import { BranchesOutlined } from "@ant-design/icons";

export const BranchPropertyPanel: React.FC<PropertyPanelProps> = ({
  nodeId,
}) => {
  const { nodes, edges, updateNodeData } = useWorkflowStore();
  const node = nodes.find((n) => n.id === nodeId);

  // 获取上游节点的可用变量
  const availableVariables = useMemo(() => {
    return getAvailableVariables(nodeId, nodes, edges);
  }, [nodeId, nodes, edges]);

  if (!node || node.type !== "branch") {
    return <div className="p-4 text-gray-500">请选择一个分支器节点</div>;
  }

  const data = node.data as BranchNodeData;

  const handleBranchesChange = (branches: BranchCondition[]) => {
    updateNodeData(nodeId, { branches });
  };

  const handleToggleElseBranch = () => {
    updateNodeData(nodeId, { showElseBranch: !data.showElseBranch });
  };

  return (
    <div className="p-4 space-y-4">
      {/* 节点标题 */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
          <BranchesOutlined />
        </div>
        <span className="font-medium text-gray-800">{data.label}</span>
      </div>

      <Divider />

      {/* 条件分支编辑器 */}
      <BranchEditor
        branches={data.branches || []}
        onChange={handleBranchesChange}
        variables={availableVariables}
      />

      <Divider />

      {/* 否则分支开关 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">否则分支</span>
          <Button
            type={data.showElseBranch ? "primary" : "default"}
            size="small"
            onClick={handleToggleElseBranch}
          >
            {data.showElseBranch ? "已启用" : "已禁用"}
          </Button>
        </div>
        {data.showElseBranch && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-800 font-medium">否则</div>
            <div className="text-xs text-gray-500">
              用于定义当 if 条件不满足时应执行的逻辑。
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
