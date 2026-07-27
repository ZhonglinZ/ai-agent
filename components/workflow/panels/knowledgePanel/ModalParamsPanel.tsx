import { InputNumber, Select, Tooltip } from "antd";
import { useEffect, useRef } from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";

/**
 * 模型参数设置浮动面板
 * 显示在属性面板左侧，点击外部自动关闭
 */
export interface ModelParamsPanelProps {
  visible: boolean;
  knowledgeBaseId?: string;
  onKnowledgeBaseIdChange: (knowledgeBaseId: string) => void;
  knowledgeBaseOptions: any[];
  topK?: number;
  scoreThreshold?: number;
  onParamChange: (field: string, value: unknown) => void;
  onClose: () => void;
}

export const ModelParamsPanel: React.FC<ModelParamsPanelProps> = ({
  visible,
  knowledgeBaseId,
  onKnowledgeBaseIdChange,
  knowledgeBaseOptions,
  topK,
  scoreThreshold,
  onParamChange,
  onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭面板（排除 Ant Design 下拉菜单等弹出层）
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 检查是否点击了面板内部
      if (panelRef.current && panelRef.current.contains(target)) {
        return;
      }

      // 检查是否点击了 Ant Design 的弹出层（Select 下拉菜单、Tooltip 等）
      // 这些组件通过 Portal 渲染到 body 上，不在面板内部
      const isAntdPopup =
        target.closest(".ant-select-dropdown") ||
        target.closest(".ant-tooltip") ||
        target.closest(".ant-popover") ||
        target.closest(".ant-modal");

      if (isAntdPopup) {
        return;
      }

      // 检查是否点击了属性面板区域（不关闭，只有点击画布才关闭）
      const isPropertyPanel = target.closest('[data-panel="property"]');
      if (isPropertyPanel) {
        return;
      }

      onClose();
    };

    if (visible) {
      // 延迟添加监听器，避免立即触发关闭
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80"
      style={{
        // 定位在属性面板左侧
        right: "calc(320px + 16px)", // 属性面板宽度 + 间距
        top: "120px",
      }}
    >
      {/* 面板标题 */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-900">知识库设置</span>
        <button
          className="text-gray-400 hover:text-gray-600 text-lg"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {/* 模型选择 */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 block mb-2">
          知识库
        </label>
        <Select
          className="w-full"
          placeholder="选择知识库"
          value={
            knowledgeBaseOptions.find((kb: any) => kb.id === knowledgeBaseId)
              ?.name
          }
          onChange={onKnowledgeBaseIdChange}
          options={knowledgeBaseOptions.map((kb: any) => ({
            label: (
              <div className="flex items-center gap-2">
                <span className="text-blue-500">✨</span>
                <span>{kb.name}</span>
              </div>
            ),
            value: kb.id,
          }))}
        />
      </div>

      {/* 参数设置 */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-3">
          参数
        </label>

        {/* Top K */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 min-w-[50px]">
            <span className="text-sm text-gray-700">Top K</span>
            <Tooltip title="返回的命中切片数量。">
              <QuestionCircleOutlined className="text-gray-400 text-xs cursor-help" />
            </Tooltip>
          </div>
          <InputNumber
            size="small"
            min={0}
            max={100}
            step={1}
            value={topK}
            onChange={(value) => onParamChange("topK", value ?? 5)}
            className="w-14"
          />
        </div>

        {/* Score Threshold */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 min-w-[50px]">
            <span className="text-sm text-gray-700">分数阈值</span>
            <Tooltip title="返回的命中切片分数阈值。">
              <QuestionCircleOutlined className="text-gray-400 text-xs cursor-help" />
            </Tooltip>
          </div>
          <InputNumber
            size="small"
            min={0}
            max={100}
            step={1}
            value={scoreThreshold}
            onChange={(value) => onParamChange("scoreThreshold", value ?? 0.2)}
            className="w-14"
          />
        </div>
      </div>
    </div>
  );
};
