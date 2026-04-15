/**
 * 工作流详情 API
 * GET /api/workflow/[id] - 获取工作流详情
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Workflow } from '@/lib/types/workflow';

// 模拟数据库
const mockWorkflows: Record<string, Workflow> = {
  '1': {
    id: '1',
    name: '用户注册流程',
    description: '新用户注册后的自动化处理流程',
    steps: [],
    runMode: 'once',
    status: 'online',
  },
  '2': {
    id: '2',
    name: '订单处理流程',
    description: '订单创建后的自动处理流程',
    steps: [],
    runMode: 'schedule',
    status: 'offline',
  },
  '3': {
    id: '3',
    name: '数据同步流程',
    description: '定时同步外部系统数据',
    steps: [],
    runMode: 'schedule',
    status: 'online',
  },
};

/**
 * GET /api/workflow/[id]
 * 获取指定 ID 的工作流详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15+: params 是 Promise，需要 await
    const { id } = await params;
    
    console.log('[API Route] 收到请求，workflow ID:', id);
    
    // 查找工作流
    const workflow = mockWorkflows[id];
    
    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          message: '工作流不存在',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    console.error('获取工作流失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取工作流失败',
      },
      { status: 500 }
    );
  }
}
