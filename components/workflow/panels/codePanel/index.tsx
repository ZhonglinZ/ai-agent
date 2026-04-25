"use client";
import { Input, Select, Divider } from "antd";
import { getAvailableVariables } from "@/lib/workflow/variableUtils";
import { CodeInputVariable, PropertyPanelProps } from "@/lib/workflow";
import { useWorkflowStore } from "@/lib/stores/workflowStore";
import { CodeEditor } from "./CodeEditor";
import { CodeNodeData } from "@/lib/workflow";
import { useMemo } from "react";
import { InputVariableEditor } from "./InputVariableEditor";

/** 编程语言选项 */
const LANGUAGE_OPTIONS: { value: CodeNodeData["language"]; label: string }[] = [
  { value: "python3", label: "Python3" },
  { value: "javascript", label: "JavaScript" },
];

/** Python3 默认代码模板 */
const PYTHON3_DEFAULT_CODE = `# 在这里，您可以通过 'args' 获取节点中的输入变量，并通过 'ret' 输出结果
# 'args' 和 'ret' 已经被正确地注入到环境中
# 下面是一个示例，首先获取节点的全部输入参数 params, 其次获取其中参数名为'input'的值:
# params = args.params;
# input = params.input;
# 下面是一个示例，输出一个包含多种数据类型的 'ret' 对象:
# ret: Output = { "name": '小明', "hobbies": ["看书", "旅游"] };
def main(arg1: str, arg2: str) -> dict:
    return {
        "result": arg1 + arg2,
    }`;

/** JavaScript 默认代码模板 */
const JAVASCRIPT_DEFAULT_CODE = `// 在这里，您可以通过 'args' 获取节点中的输入变量，并通过 'ret' 输出结果
// 'args' 和 'ret' 已经被正确地注入到环境中
// 下面是一个示例，首先获取节点的全部输入参数 params, 其次获取其中参数名为'input'的值:
// const params = args.params;
// const input = params.input;
// 下面是一个示例，输出一个包含多种数据类型的 'ret' 对象:
// ret = { "name": '小明', "hobbies": ["看书", "旅游"] };
function main(arg1, arg2) {
    return {
        "result": arg1 + arg2,
    };
}`;

export const CodePropertyPanel: React.FC<PropertyPanelProps> = ({ nodeId }) => {
  const { nodes, edges, updateNodeData } = useWorkflowStore();
  const node = nodes.find((n) => n.id === nodeId);

  // 获取上游节点的可用变量
  const availableVariables = useMemo(() => {
    return getAvailableVariables(nodeId, nodes, edges);
  }, [nodeId, nodes, edges]);

  if (!node || node.type !== "code") {
    return <div className="p-4 text-gray-500">请选择一个代码节点</div>;
  }

  const data = node.data as CodeNodeData;

  const handleDescriptionChange = (description: string) => {
    updateNodeData(nodeId, { description });
  };

  const handleLanguageChange = (language: CodeNodeData["language"]) => {
    const newCode =
      language === "python3" ? PYTHON3_DEFAULT_CODE : JAVASCRIPT_DEFAULT_CODE;
    updateNodeData(nodeId, { language, code: newCode });
  };

  const handleCodeChange = (code: string) => {
    updateNodeData(nodeId, { code });
  };

  const handleInputsChange = (inputs: CodeInputVariable[]) => {
    updateNodeData(nodeId, { inputs });
  };

  return (
    <div className="p-4 space-y-4">
      {/* 节点标题 */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm">
          <span className="font-bold">&lt;/&gt;</span>
        </div>
        <span className="font-medium text-gray-800">{data.label}</span>
      </div>

      <Divider className="my-3" />

      {/* 描述 */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">描述</span>
        <Input
          value={data.description || ""}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="添加描述..."
        />
      </div>

      <Divider className="my-3" />

      {/* 输入变量 */}
      <InputVariableEditor
        items={data.inputs || []}
        onChange={handleInputsChange}
        variables={availableVariables}
      />

      <Divider className="my-3" />

      {/* 语言选择 */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">编程语言</span>
        <Select
          value={data.language}
          onChange={handleLanguageChange}
          options={LANGUAGE_OPTIONS}
          className="w-full"
        />
      </div>

      {/* 代码编辑器 */}
      <CodeEditor
        code={data.code || ""}
        onChange={handleCodeChange}
        language={data.language}
      />

      <Divider className="my-3" />

      {/* 输出变量 */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">输出</span>
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          {(data.outputs || []).map((output) => (
            <div
              key={output.name}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-800 font-medium">{output.name}</span>
              <span className="text-gray-400">{output.type}</span>
            </div>
          ))}
          {(!data.outputs || data.outputs.length === 0) && (
            <div className="text-gray-400 text-sm">暂无输出变量</div>
          )}
        </div>
      </div>
    </div>
  );
};
