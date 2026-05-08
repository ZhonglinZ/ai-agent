/**
 * 工作流集合 API
 * GET /api/workflow — 列表
 * POST /api/workflow — 创建
 */

import { NextResponse } from 'next/server';
import { workflowDbService } from '@/lib/services/workflowDb.service';

export async function GET() {
  try {
    const data = await workflowDbService.getWorkflowList();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取工作流列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取工作流列表失败' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const data = await workflowDbService.createWorkflow();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建工作流失败:', error);
    return NextResponse.json(
      { success: false, message: '创建工作流失败' },
      { status: 500 }
    );
  }
}
