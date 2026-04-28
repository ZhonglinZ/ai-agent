import { BranchCondition } from "@/lib/workflow";
import { WorkflowVariable } from "@/lib/workflow/variableUtils";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Input } from "antd";
import { VariableInput } from "../variableSelector/VariableInput";

interface BranchEditorProps {
  branches: BranchCondition[];
  onChange: (branches: BranchCondition[]) => void;
  variables: WorkflowVariable[];
}

const BranchEditor: React.FC<BranchEditorProps> = ({
  branches,
  onChange,
  variables,
}) => {
  const handleAdd = () => {
    const newBranch: BranchCondition = {
      id: `branch-${Date.now()}`,
      label: branches.length === 0 ? "如果" : "否则如果",
      condition: "",
    };
    onChange([...branches, newBranch]);
  };

  const handleRemove = (id: string) => {
    onChange(branches.filter((branch) => branch.id !== id));
  };

  const handleChange = (
    id: string,
    field: "label" | "condition",
    newValue: string,
  ) => {
    onChange(
      branches.map((branch) =>
        branch.id === id ? { ...branch, [field]: newValue } : branch,
      ),
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">条件分支</span>
        <button onClick={handleAdd}>
          <PlusOutlined />
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-400">
          点击 + 添加条件分支
        </div>
      ) : (
        <div className="space-y-3">
          {branches.map((branch, index) => (
            <div
              key={branch.id}
              className="border border-gray-200 rounded-lg p-3 space-y-2"
            >
              {/* 分支标签 */}
              <div className="flex items-center gap-2">
                <Input
                  value={branch.label}
                  onChange={(e) =>
                    handleChange(branch.id, "label", e.target.value)
                  }
                  placeholder={index === 0 ? "如果" : "否则如果"}
                />
                <button onClick={() => handleRemove(branch.id)}>
                  <MinusCircleOutlined />
                </button>
              </div>

              {/* 条件表达式 */}
              <div className="space-y-1">
                <div className="text-xs text-gray-500">+ 添加条件</div>
                <VariableInput
                  value={branch.condition || ""}
                  onChange={(v) => handleChange(branch.id, "condition", v)}
                  placeholder="添加条件"
                  variables={variables}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BranchEditor;
