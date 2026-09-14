/**
 * 循环节点属性面板
 *
 * 配置最大迭代次数、可选退出条件、输出变量映射
 * 子图内容通过双击节点进入编辑，不在此面板拖拽
 */
"use client";

import React from "react";
import { Input, InputNumber, Button, Divider, Tooltip } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useWorkflowStore } from "@/lib/stores/workflowStore";
import type {
  PropertyPanelProps,
  LoopNodeData,
  LoopOutputVariable,
} from "@/lib/workflow/types";

const generateId = () =>
  `out_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

interface VariableRowProps {
  variable: LoopOutputVariable;
  onUpdate: (id: string, field: keyof LoopOutputVariable, value: string) => void;
  onRemove: (id: string) => void;
}

const VariableRow: React.FC<VariableRowProps> = ({
  variable,
  onUpdate,
  onRemove,
}) => {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Input
        placeholder="变量名"
        value={variable.name}
        onChange={(e) => onUpdate(variable.id, "name", e.target.value)}
        className="flex-1"
      />
      <Input
        placeholder="如 {{改写.text}}"
        value={variable.value}
        onChange={(e) => onUpdate(variable.id, "value", e.target.value)}
        className="flex-1"
      />
      <Tooltip title="删除">
        <Button
          type="text"
          icon={<MinusCircleOutlined />}
          onClick={() => onRemove(variable.id)}
          className="text-gray-400 hover:text-red-500"
        />
      </Tooltip>
    </div>
  );
};

export const LoopPropertyPanel: React.FC<PropertyPanelProps<LoopNodeData>> = ({
  nodeId,
  data,
}) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const outputs = data.outputs || [];

  const handleChange = (field: keyof LoopNodeData, value: unknown) => {
    updateNodeData(nodeId, { [field]: value });
  };

  const handleAddVariable = () => {
    const newVariable: LoopOutputVariable = {
      id: generateId(),
      name: "",
      value: "",
    };
    handleChange("outputs", [...outputs, newVariable]);
  };

  const handleRemoveVariable = (id: string) => {
    handleChange(
      "outputs",
      outputs.filter((v) => v.id !== id),
    );
  };

  const handleUpdateVariable = (
    id: string,
    field: keyof LoopOutputVariable,
    value: string,
  ) => {
    handleChange(
      "outputs",
      outputs.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <Input
          placeholder="添加描述..."
          value={data.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          variant="borderless"
          className="text-gray-500 px-0"
        />
      </div>

      <Divider className="my-3" />

      <div>
        <div className="font-medium text-gray-900 mb-2">最大迭代次数</div>
        <InputNumber
          min={1}
          max={100}
          value={data.maxIterations ?? 5}
          onChange={(value) =>
            handleChange("maxIterations", Math.max(1, value ?? 5))
          }
          className="w-full"
        />
        <div className="text-xs text-gray-400 mt-1">
          硬上限，防止退出条件永远不满足
        </div>
      </div>

      <div>
        <div className="font-medium text-gray-900 mb-2">退出条件（可选）</div>
        <Input
          placeholder='如 {{质量判定.passed}} == true'
          value={data.breakCondition || ""}
          onChange={(e) => handleChange("breakCondition", e.target.value)}
        />
        <div className="text-xs text-gray-400 mt-1">
          为空则跑满最大次数；每轮子图结束后求值
        </div>
      </div>

      <Divider className="my-3" />

      <div>
        <div className="font-medium text-gray-900 mb-1">输出变量</div>
        <div className="text-xs text-gray-400 mb-3">
          循环结束后写到父图，下游可用 {"{{循环.text}}"} 引用
        </div>

        <div>
          {outputs.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-400 mb-3">
              未配置变量
            </div>
          ) : (
            outputs.map((variable) => (
              <VariableRow
                key={variable.id}
                variable={variable}
                onUpdate={handleUpdateVariable}
                onRemove={handleRemoveVariable}
              />
            ))
          )}
        </div>

        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          onClick={handleAddVariable}
        >
          添加
        </Button>
      </div>

      <div className="rounded-lg bg-orange-50 border border-orange-100 px-3 py-2 text-xs text-orange-700">
        双击画布上的循环节点，可进入内部子工作流编辑
      </div>
    </div>
  );
};
