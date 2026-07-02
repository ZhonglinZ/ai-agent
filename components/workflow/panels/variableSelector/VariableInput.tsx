import { useRef, useState } from "react";
import { Input, type InputRef } from "antd";
import { WorkflowVariable } from "@/lib/workflow/variableUtils";
import { VariableSelector } from "./VariableSelector";

const DEFAULT_PLACEHOLDER = "点击 {x} 插入变量";

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
  className,
}) => {
  const [showSelector, setShowSelector] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputRef>(null);
  const cursorPosRef = useRef<number>(0);

  const syncCursorPos = () => {
    const input = inputRef.current?.input;
    if (input) {
      cursorPosRef.current = input.selectionStart ?? value.length;
    }
  };

  const handleOpenSelector = () => {
    syncCursorPos();
    setShowSelector(true);
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
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={syncCursorPos}
        onClick={syncCursorPos}
        onKeyUp={syncCursorPos}
        placeholder={placeholder ?? DEFAULT_PLACEHOLDER}
        className={className}
        suffix={
          <button
            type="button"
            className="font-mono text-xs text-blue-500 hover:text-blue-600 px-0.5"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleOpenSelector}
            title="插入变量"
          >
            {"{x}"}
          </button>
        }
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
