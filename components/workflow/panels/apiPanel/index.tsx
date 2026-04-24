import { useWorkflowStore } from "@/lib/stores/workflowStore";
import { APINodeData, PropertyPanelProps } from "@/lib/workflow";
import { getAvailableVariables } from "@/lib/workflow/variableUtils";
import { Input, Select, Divider, Switch, InputNumber } from "antd";
import { useMemo, useCallback } from "react";
import { JsonEditor, KeyValueEditor, VariableInput } from "./VariableSelector";
import TextArea from "antd/es/input/TextArea";

// HTTP 方法常量
const HTTP_METHODS = [
  { value: "GET", label: "GET", color: "text-green-600" },
  { value: "POST", label: "POST", color: "text-blue-600" },
  { value: "PUT", label: "PUT", color: "text-orange-600" },
  { value: "DELETE", label: "DELETE", color: "text-red-600" },
  { value: "PATCH", label: "PATCH", color: "text-purple-600" },
];

// 请求体类型常量
const BODY_TYPES = [
  { value: "none", label: "无" },
  { value: "form-data", label: "form-data" },
  { value: "x-www-form-urlencoded", label: "x-www-form-urlencoded" },
  { value: "json", label: "JSON" },
  { value: "raw", label: "Raw" },
];

export const APIPropertyPanel: React.FC<PropertyPanelProps<APINodeData>> = ({
  nodeId,
  data,
}) => {
  const { nodes, edges, updateNodeData } = useWorkflowStore();

  // 获取上游可用变量
  const availableVariables = useMemo(() => {
    return getAvailableVariables(nodeId, nodes, edges);
  }, [nodeId, nodes, edges]);

  // 更新节点数据
  const handleUpdate = useCallback(
    <K extends keyof APINodeData>(field: K, value: APINodeData[K]) => {
      updateNodeData(nodeId, { [field]: value });
    },
    [nodeId, updateNodeData]
  );

  return (
    <div className="space-y-4">
      {/* 描述 */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-1">描述</div>
        <Input.TextArea
          value={data.description || ""}
          onChange={(e) => handleUpdate("description", e.target.value)}
          placeholder="描述这个 API 节点的用途..."
          rows={2}
        />
      </div>

      <Divider className="my-3" />

      {/* API 配置 */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">API</div>
        <div className="flex gap-2">
          <Select
            value={data.method}
            onChange={(v) => handleUpdate("method", v)}
            options={HTTP_METHODS.map((m) => ({
              value: m.value,
              label: <span className={m.color}>{m.label}</span>,
            }))}
            className="w-24"
          />
          <div className="flex-1">
            <VariableInput
              value={data.url}
              onChange={(v) => handleUpdate("url", v)}
              placeholder="https://api.example.com/path"
              variables={availableVariables}
            />
          </div>
        </div>
      </div>

      <Divider className="my-3" />

      {/* 请求参数 */}
      <KeyValueEditor
        title="请求参数"
        items={data.params}
        onChange={(items) => handleUpdate("params", items)}
        variables={availableVariables}
        addButtonText="添加参数"
      />

      <Divider className="my-3" />

      {/* 请求头 */}
      <KeyValueEditor
        title="请求头"
        items={data.headers}
        onChange={(items) => handleUpdate("headers", items)}
        variables={availableVariables}
        addButtonText="添加请求头"
      />

      <Divider className="my-3" />

      {/* 鉴权 */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">鉴权</div>
        <Switch
          checked={data.authEnabled}
          onChange={(checked) => handleUpdate("authEnabled", checked)}
        />
      </div>

      <Divider className="my-3" />

      {/* 请求体 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-700">请求体</div>
          <Select
            value={data.bodyType}
            onChange={(v) => handleUpdate("bodyType", v)}
            options={BODY_TYPES}
            className="w-40"
          />
        </div>

        {/* 根据类型显示不同的编辑器 */}
        {data.bodyType === "json" && (
          <JsonEditor
            value={data.bodyJson}
            onChange={(v) => handleUpdate("bodyJson", v)}
            variables={availableVariables}
          />
        )}

        {data.bodyType === "raw" && (
          <TextArea
            value={data.bodyRaw}
            onChange={(e) => handleUpdate("bodyRaw", e.target.value)}
            placeholder="输入原始文本..."
            rows={4}
          />
        )}

        {(data.bodyType === "form-data" ||
          data.bodyType === "x-www-form-urlencoded") && (
          <KeyValueEditor
            title=""
            items={data.bodyFormData}
            onChange={(items) => handleUpdate("bodyFormData", items)}
            variables={availableVariables}
            addButtonText="添加字段"
          />
        )}
      </div>

      <Divider className="my-3" />

      {/* 超时设置 */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">超时设置</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">重试间隔（秒）</div>
            <InputNumber
              value={data.timeout}
              onChange={(v) => handleUpdate("timeout", v || 120)}
              min={1}
              max={600}
              className="w-full"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">重试次数</div>
            <InputNumber
              value={data.retryCount}
              onChange={(v) => handleUpdate("retryCount", v || 3)}
              min={0}
              max={10}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <Divider className="my-3" />

      {/* 输出 */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">输出</div>
        <div className="space-y-2">
          {data.outputs?.map((output) => (
            <div
              key={output.name}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <span className="text-sm text-gray-800">{output.name}</span>
              <span className="text-xs text-gray-400 capitalize">
                {output.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
