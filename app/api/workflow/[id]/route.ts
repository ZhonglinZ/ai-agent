/**
 * 单个工作流 API
 * GET    /api/workflow/[id] — 完整画布数据（StoredWorkflowData）
 * PATCH  /api/workflow/[id] — 更新基础字段
 * PUT    /api/workflow/[id] — 保存完整画布数据
 * DELETE /api/workflow/[id] — 删除
 */

import { NextRequest, NextResponse } from 'next/server';
import type { UpdateWorkflowRequest } from '@/lib/types/workflow';
import type { StoredWorkflowData } from '@/lib/services/workflowStorage.service';
import { workflowDbService } from '@/lib/services/workflowDb.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await workflowDbService.getWorkflowData(id);

    if (!data) {
      return NextResponse.json(
        { success: false, message: '工作流不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取工作流失败:', error);
    return NextResponse.json(
      { success: false, message: '获取工作流失败' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateWorkflowRequest;
    const updated = await workflowDbService.updateWorkflow(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: '工作流不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('更新工作流失败:', error);
    return NextResponse.json(
      { success: false, message: '更新工作流失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as StoredWorkflowData;

    if (body.id !== id) {
      return NextResponse.json(
        { success: false, message: '请求体中的 id 与路径不一致' },
        { status: 400 }
      );
    }

    const existing = await workflowDbService.getWorkflowData(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: '工作流不存在' },
        { status: 404 }
      );
    }

    await workflowDbService.saveWorkflowData(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('保存工作流失败:', error);
    return NextResponse.json(
      { success: false, message: '保存工作流失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await workflowDbService.deleteWorkflow(id);

    if (!ok) {
      return NextResponse.json(
        { success: false, message: '工作流不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除工作流失败:', error);
    return NextResponse.json(
      { success: false, message: '删除工作流失败' },
      { status: 500 }
    );
  }
}
