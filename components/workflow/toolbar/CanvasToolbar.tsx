/**
 * 画布工具栏组件
 *
 * 位于画布底部中央，提供节点添加、缩放、撤销等功能
 */
"use client";

import React, { useState } from "react";
import { Button, Popover, Tooltip, Divider } from "antd";
import {
  PlusOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  AimOutlined,
  UndoOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { NodeSelector } from "./NodeSelector";

export const CanvasToolbar: React.FC = () => {
  const [selectorOpen, setSelectorOpen] = useState(false);

  return (
    <div
      className="bg-white rounded-full shadow-lg border border-gray-200
                    px-2 py-1.5 flex items-center gap-1"
    >
      {/* 添加节点按钮 */}
      <Popover
        content={<NodeSelector onSelect={() => setSelectorOpen(false)} />}
        trigger="click"
        placement="top"
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        arrow={false}
      >
        <Button type="primary" icon={<PlusOutlined />} className="rounded-full">
          节点
        </Button>
      </Popover>

      <Divider type="vertical" className="h-6 mx-1" />

      {/* 缩放控制（占位，后续实现） */}
      <Tooltip title="缩小">
        <Button
          type="text"
          icon={<ZoomOutOutlined />}
          className="rounded-full"
          disabled
        />
      </Tooltip>
      <Tooltip title="放大">
        <Button
          type="text"
          icon={<ZoomInOutlined />}
          className="rounded-full"
          disabled
        />
      </Tooltip>
      <Tooltip title="适应画布">
        <Button
          type="text"
          icon={<AimOutlined />}
          className="rounded-full"
          disabled
        />
      </Tooltip>

      <Divider type="vertical" className="h-6 mx-1" />

      {/* 撤销/重做（占位，后续实现） */}
      <Tooltip title="撤销">
        <Button
          type="text"
          icon={<UndoOutlined />}
          className="rounded-full"
          disabled
        />
      </Tooltip>
      <Tooltip title="重做">
        <Button
          type="text"
          icon={<RedoOutlined />}
          className="rounded-full"
          disabled
        />
      </Tooltip>
    </div>
  );
};
