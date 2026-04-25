import { useState, useRef } from "react";
import { Input } from "antd";
import { WorkflowVariable } from "@/lib/workflow/variableUtils";
import { VariableSelector } from "./VariableSelector";

/**
 * 带变量选择功能的输入框
 */
export interface VariableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variables: WorkflowVariable[];
  className?: string;
}

export const VariableInput: React.FC<VariableInputProps> = ({
  value,
  onChange,
  placeholder,
  variables,
}) => {
  const [showSelector, setShowSelector] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cursorPosRef = useRef<number>(0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "/") {
      e.preventDefault(); // 阻止 '/' 输入
      cursorPosRef.current = e.currentTarget.selectionStart || 0;
      setShowSelector(true);
    }
  };

  const handleSelectVariable = (varName: string) => {
    const before = value.slice(0, cursorPosRef.current);
    const after = value.slice(cursorPosRef.current);
    onChange(`${before}{{${varName}}}${after}`);
    setShowSelector(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      <VariableSelector
        visible={showSelector}
        onSelect={handleSelectVariable}
        onClose={() => setShowSelector(false)}
        variables={variables}
        anchorRef={wrapperRef}
      />
    </div>
  );
};
