import { Input } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { CodeInputVariable } from "@/lib/workflow";
import { WorkflowVariable } from "@/lib/workflow/variableUtils";
import { VariableInput } from "./VariableInput";

interface InputVariableEditorProps {
  items: CodeInputVariable[];
  onChange: (items: CodeInputVariable[]) => void;
  variables: WorkflowVariable[];
}

export const InputVariableEditor: React.FC<InputVariableEditorProps> = ({
  items,
  onChange,
  variables,
}) => {
  const handleAdd = () => {
    const newItem: CodeInputVariable = {
      id: `input-${Date.now()}`,
      name: `arg${items.length + 1}`,
      value: "",
    };
    onChange([...items, newItem]);
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleChange = (
    id: string,
    field: "name" | "value",
    newValue: string
  ) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: newValue } : item
      )
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span>输入</span>
        <button onClick={handleAdd}>
          <PlusOutlined />
        </button>
      </div>
      {items.map((item) => (
        <div key={item.id} className="grid grid-cols-[1fr_1fr_24px] gap-2">
          <Input
            value={item.name}
            onChange={(e) => handleChange(item.id, "name", e.target.value)}
            placeholder="变量名"
            size="small"
          />
          <VariableInput
            value={item.value}
            onChange={(v) => handleChange(item.id, "value", v)}
            placeholder="设置变量值"
            variables={variables}
          />
          <button onClick={() => handleRemove(item.id)}>
            <MinusCircleOutlined />
          </button>
        </div>
      ))}
    </div>
  );
};
