/**
 * 单个智能体 API
 * GET    /api/agent/[id] — 详情
 * PATCH  /api/agent/[id] — 部分更新
 * PUT    /api/agent/[id] — 整份保存
 * DELETE /api/agent/[id] — 删除
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Agent } from '@/lib/types/agent';
import { agentDbService } from '@/lib/services/agentDb.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await agentDbService.getAgentById(id);

    if (!data) {
      return NextResponse.json(
        { success: false, message: '智能体不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取智能体失败:', error);
    return NextResponse.json(
      { success: false, message: '获取智能体失败' },
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
    const body = (await request.json()) as Partial<Agent>;
    const updated = await agentDbService.updateAgent(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: '智能体不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('更新智能体失败:', error);
    return NextResponse.json(
      { success: false, message: '更新智能体失败' },
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
    const body = (await request.json()) as Agent;

    if (body.id !== id) {
      return NextResponse.json(
        { success: false, message: '请求体中的 id 与路径不一致' },
        { status: 400 }
      );
    }

    const existing = await agentDbService.getAgentById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: '智能体不存在' },
        { status: 404 }
      );
    }

    await agentDbService.saveAgent(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('保存智能体失败:', error);
    return NextResponse.json(
      { success: false, message: '保存智能体失败' },
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
    const ok = await agentDbService.deleteAgent(id);

    if (!ok) {
      return NextResponse.json(
        { success: false, message: '智能体不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除智能体失败:', error);
    return NextResponse.json(
      { success: false, message: '删除智能体失败' },
      { status: 500 }
    );
  }
}
