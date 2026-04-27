'use client';

import React, { useMemo } from 'react';
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useWorkflowStore } from '@/lib/stores/workflowStore';
import { validateWorkflowNodes, groupIssuesByNode, type ValidationIssue } from '@/lib/workflow';
import { nodeRegistry } from '@/lib/workflow/nodeRegistry';

interface ValidationChecklistProps {
  /** 是否显示 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
}

export const ValidationChecklist: React.FC<ValidationChecklistProps> = ({
  open,
  onClose,
}) => {
  const { nodes, edges, setSelectedNodeId } = useWorkflowStore();

  // 执行验证
  const validationResult = useMemo(() => {
    return validateWorkflowNodes(nodes, edges);
  }, [nodes, edges]);

  // 按节点分组问题
  const groupedIssues = useMemo(() => {
    return groupIssuesByNode(validationResult.issues);
  }, [validationResult.issues]);
  // 处理点击问题项，定位到对应节点
const handleIssueClick = (issue: ValidationIssue) => {
    setSelectedNodeId(issue.nodeId);
    onClose();
  };

  const renderIssues = () => {
    // 如果没有问题，显示成功状态
    if (validationResult.isValid) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
          <p className="text-lg text-gray-600">所有检查项均已通过！</p>
          <p className="text-sm text-gray-400 mt-2">工作流已准备就绪，可以发布</p>
        </div>
      );
    }
  
    // 有问题，按节点分组展示
    return (
      <div className="space-y-4">
        {Array.from(groupedIssues.entries()).map(([nodeId, issues]) => {
          const firstIssue = issues[0];
          const nodeConfig = nodeRegistry.get(firstIssue.nodeType);
  
          return (
            <div key={nodeId} className="bg-white border border-gray-200 rounded-lg">
              {/* 节点头部 */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
                {/* 节点图标 */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: nodeConfig?.iconColor }}
                >
                  {nodeConfig?.icon}
                </div>
                {/* 节点标签 */}
                <span className="font-medium">{firstIssue.nodeLabel}</span>
              </div>
  
              {/* 问题列表 */}
              <div className="px-4 py-2">
                {issues.map((issue, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 py-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleIssueClick(issue)}
                  >
                    <ExclamationCircleOutlined className="text-orange-500" />
                    <span className="text-sm">{issue.message}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 如果不显示，返回 null
  if (!open) {
    return null;
  }
  
  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-[640px] max-h-[70vh] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50">
      {/* 头部 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <span className="text-lg font-medium text-gray-800">
          检查清单({validationResult.issues.length})
        </span>
        <CloseOutlined
          className="text-gray-400 hover:text-gray-600 cursor-pointer text-base"
          onClick={onClose}
        />
      </div>
  
      {/* 内容区域 */}
      <div className="overflow-y-auto max-h-[calc(70vh-64px)]">
        <div className="px-6 py-4">
          {/* 提示文字 */}
          <div className="mb-4 text-sm text-gray-500">
            发布前确保所有问题均已解决
          </div>
  
          {/* 问题列表 */}
          {renderIssues()}
        </div>
      </div>
    </div>
  );
};