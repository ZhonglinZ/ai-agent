import { InputNumber, Select, Slider, Switch, Tooltip } from "antd";
import { useEffect, useRef } from "react";
import { MODEL_OPTIONS } from "../../nodes";
import { QuestionCircleOutlined } from "@ant-design/icons";

/**
 * 模型参数设置浮动面板
 * 显示在属性面板左侧，点击外部自动关闭
 */
export interface ModelParamsPanelProps {
  visible: boolean;
  model?: string;
  temperatureEnabled?: boolean;
  temperature?: number;
  topPEnabled?: boolean;
  topP?: number;
  onModelChange: (model: string) => void;
  onParamChange: (field: string, value: unknown) => void;
  onClose: () => void;
}

export const ModelParamsPanel: React.FC<ModelParamsPanelProps> = ({
  visible,
  model,
  temperatureEnabled = true,
  temperature = 0.6,
  topPEnabled = false,
  topP = 0.8,
  onModelChange,
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
        <span className="text-sm font-medium text-gray-900">模型设置</span>
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
          模型
        </label>
        <Select
          className="w-full"
          placeholder="选择模型"
          value={model}
          onChange={onModelChange}
          options={MODEL_OPTIONS.map((m) => ({
            label: (
              <div className="flex items-center gap-2">
                <span className="text-blue-500">✨</span>
                <span>{m.name}</span>
              </div>
            ),
            value: m.id,
          }))}
        />
      </div>

      {/* 参数设置 */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-3">
          参数
        </label>

        {/* 温度 */}
        <div className="flex items-center gap-2 mb-4">
          <Switch
            size="small"
            checked={temperatureEnabled}
            onChange={(checked) => onParamChange("temperatureEnabled", checked)}
          />
          <div className="flex items-center gap-1 min-w-[50px]">
            <span className="text-sm text-gray-700">温度</span>
            <Tooltip title="控制输出的随机性。较高的值会使输出更随机，较低的值会使输出更确定。">
              <QuestionCircleOutlined className="text-gray-400 text-xs cursor-help" />
            </Tooltip>
          </div>
          <Slider
            className="flex-1"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(value) => onParamChange("temperature", value)}
            disabled={!temperatureEnabled}
          />
          <InputNumber
            size="small"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(value) => onParamChange("temperature", value ?? 0.6)}
            disabled={!temperatureEnabled}
            className="w-14"
          />
        </div>

        {/* Top P */}
        <div className="flex items-center gap-2">
          <Switch
            size="small"
            checked={topPEnabled}
            onChange={(checked) => onParamChange("topPEnabled", checked)}
          />
          <div className="flex items-center gap-1 min-w-[50px]">
            <span className="text-sm text-gray-700">Top P</span>
            <Tooltip title="核采样参数。模型会从累积概率超过 P 的 token 中采样。">
              <QuestionCircleOutlined className="text-gray-400 text-xs cursor-help" />
            </Tooltip>
          </div>
          <Slider
            className="flex-1"
            min={0}
            max={1}
            step={0.1}
            value={topP}
            onChange={(value) => onParamChange("topP", value)}
            disabled={!topPEnabled}
          />
          <InputNumber
            size="small"
            min={0}
            max={1}
            step={0.1}
            value={topP}
            onChange={(value) => onParamChange("topP", value ?? 0.8)}
            disabled={!topPEnabled}
            className="w-14"
          />
        </div>
      </div>
    </div>
  );
};
