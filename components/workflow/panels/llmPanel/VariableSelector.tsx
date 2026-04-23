import { type WorkflowVariable } from "@/lib/workflow/variableUtils";
import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * 变量选择器组件
 */
export interface VariableSelectorProps {
  visible: boolean;
  onSelect: (variableName: string) => void;
  onClose: () => void;
  variables: WorkflowVariable[];
}

export const VariableSelector: React.FC<VariableSelectorProps> = ({
  visible,
  onSelect,
  onClose,
  variables,
}) => {
  const [searchText, setSearchText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // 过滤变量
  const filteredVariables = useMemo(() => {
    if (!searchText) return variables;
    return variables.filter((v) =>
      v.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [variables, searchText]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
    >
      {/* 搜索框 */}
      <div className="p-2 border-b border-gray-100">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="搜索变量..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
          autoFocus
        />
      </div>

      {/* 变量列表 */}
      <div className="max-h-48 overflow-y-auto p-2">
        {filteredVariables.length === 0 ? (
          <div className="text-center text-gray-400 py-4 text-sm">
            {variables.length === 0
              ? "暂无变量，请先在开始节点配置输入变量"
              : "未找到匹配的变量"}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredVariables.map((variable) => (
              <div
                key={variable.id}
                className="flex items-center justify-between p-2 rounded hover:bg-blue-50 cursor-pointer"
                onClick={() => {
                  onSelect(variable.name);
                  onClose();
                  setSearchText("");
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-blue-500 font-mono text-xs bg-blue-50 px-1.5 py-0.5 rounded">
                    {"{x}"}
                  </span>
                  <span className="text-gray-800 font-medium">
                    {variable.name}
                  </span>
                  <span className="text-gray-400 text-xs">
                    来自: {variable.sourceNodeLabel}
                  </span>
                </div>
                <span className="text-gray-400 text-xs">{variable.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
