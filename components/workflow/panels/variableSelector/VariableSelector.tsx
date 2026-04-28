import { WorkflowVariable } from "@/lib/workflow/variableUtils";
import { useEffect, useRef, useState, useMemo } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface VariableSelectorProps {
  visible: boolean;
  onSelect: (variableName: string) => void;
  onClose: () => void;
  variables: WorkflowVariable[];
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

export const VariableSelector: React.FC<VariableSelectorProps> = ({
  visible,
  onSelect,
  onClose,
  variables,
  anchorRef,
}) => {
  const [search, setSearch] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // 弹出时清空搜索框
  useEffect(() => {
    if (visible) setSearch("");
  }, [visible]);

  // 计算浮层位置（锚定到输入框下方）
  useEffect(() => {
    if (visible && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.left });
    }
  }, [visible, anchorRef]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [visible, onClose]);

  // 搜索过滤
  const filteredVariables = useMemo(() => {
    if (!search) return variables;
    return variables.filter(
      (v) =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.sourceNodeLabel.toLowerCase().includes(search.toLowerCase()),
    );
  }, [variables, search]);

  if (!visible) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-9999 bg-white border border-gray-200 rounded-lg shadow-lg w-64 max-h-80 overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      {/* 搜索框 */}
      <div className="p-2 border-b border-gray-100">
        <Input
          size="small"
          placeholder="搜索变量..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {/* 变量列表 */}
      <div className="max-h-60 overflow-y-auto p-2">
        {filteredVariables.length === 0 ? (
          <div className="text-center text-gray-400 py-4 text-sm">
            {variables.length === 0 ? "暂无可用变量" : "未找到匹配的变量"}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredVariables.map((variable) => (
              <div
                key={variable.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                onClick={() => onSelect(variable.name)}
              >
                <div className="flex flex-col">
                  <span className="text-gray-800 font-medium text-sm">
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
