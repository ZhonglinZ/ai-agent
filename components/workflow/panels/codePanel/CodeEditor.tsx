import { useState, useCallback } from "react";
import { message, Modal } from "antd";
import { CopyOutlined, ExpandOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";

export interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenCode, setFullscreenCode] = useState(code);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    message.success("代码已复制到剪贴板");
  }, [code]);

  const handleOpenFullscreen = () => {
    setFullscreenCode(code);
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    onChange(fullscreenCode); // 保存全屏中的修改
    setIsFullscreen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <span>代码</span>
        <div>
          <button onClick={handleCopy}>
            <CopyOutlined />
          </button>
          <button onClick={handleOpenFullscreen}>
            <ExpandOutlined />
          </button>
        </div>
      </div>
      <TextArea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          language === "python3"
            ? "# 输入 Python3 代码..."
            : "// 输入 JavaScript 代码..."
        }
        autoSize={{ minRows: 8, maxRows: 15 }}
        style={{ backgroundColor: "#1e1e1e", color: "#d4d4d4" }}
      />
      <Modal
        open={isFullscreen}
        onCancel={handleCloseFullscreen}
        onOk={handleCloseFullscreen}
        width="90vw"
      >
        <TextArea
          value={fullscreenCode}
          onChange={(e) => setFullscreenCode(e.target.value)}
        />
      </Modal>
    </div>
  );
};
