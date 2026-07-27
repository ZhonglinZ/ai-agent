/**
 * 知识库服务层
 *
 * 负责知识库的 CRUD 操作，数据存储在 localStorage
 */

import type {
  KnowledgeBase,
  KnowledgeDocument,
  DocumentDetail,
  DocumentChunk,
  CreateKnowledgeBaseRequest,
  UpdateKnowledgeBaseRequest,
  KnowledgeTag,
  HitTestResult,
  HitTestHistory,
  KnowledgeConfig,
} from "@/lib/types/knowledge";
import { http } from "./http";

// localStorage keys
const STORAGE_KEYS = {
  KNOWLEDGE_BASES: "knowledge_bases",
  DOCUMENTS: "knowledge_documents",
  DOCUMENT_DETAILS: "knowledge_document_details",
  TAGS: "knowledge_tags",
};

/**
 * 生成唯一 ID
 */
const generateId = (): string => {
  return `kb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * 默认配置
 */
const DEFAULT_CONFIG: KnowledgeConfig = {
  parseStrategy: "text",
  chunkStrategy: "auto",
  chunkSize: 500,
  chunkOverlap: 50,
};

/**
 * 知识库服务类
 */
class KnowledgeService {
  // ==================== 知识库操作 ====================

  /**
   * 获取所有知识库
   */
  private readonly baseUrl = "/api/knowledge";
  async getKnowledgeBases(): Promise<KnowledgeBase[]> {
    const response = await http.get(`${this.baseUrl}`);
    return response.data;
  }

  /**
   * 根据 ID 获取知识库
   */
  async getKnowledgeBaseById(id: string): Promise<KnowledgeBase | null> {
    const response = await http.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * 创建知识库
   */
  async createKnowledgeBase(
    request: CreateKnowledgeBaseRequest,
  ): Promise<KnowledgeBase> {
    const now = new Date().toISOString();
    const response = await http.post(`${this.baseUrl}`, request);
    return response.data;
  }

  /**
   * 更新知识库
   */
  async updateKnowledgeBase(
    id: string,
    request: UpdateKnowledgeBaseRequest,
  ): Promise<KnowledgeBase | null> {
    const response = await http.put(`${this.baseUrl}/${id}`, request);
    return response.data;
  }

  /**
   * 删除知识库
   */
  async deleteKnowledgeBase(id: string): Promise<boolean> {
    const response = await http.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * 搜索知识库
   */
  async searchKnowledgeBases(keyword: string): Promise<KnowledgeBase[]> {
    const response = await http.get(`${this.baseUrl}/search`, {
      params: { keyword },
    });
    return response.data;
  }

  // ==================== 配置操作 ====================

  /**
   * 获取知识库配置
   */
  getConfig(knowledgeBaseId: string): KnowledgeConfig {
    if (typeof window === "undefined") return DEFAULT_CONFIG;
    const key = `knowledge_config_${knowledgeBaseId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : DEFAULT_CONFIG;
  }

  /**
   * 保存知识库配置
   */
  saveConfig(knowledgeBaseId: string, config: KnowledgeConfig): void {
    const key = `knowledge_config_${knowledgeBaseId}`;
    localStorage.setItem(key, JSON.stringify(config));
  }

  // ==================== 文档操作 ====================

  /**
   * 获取所有文档
   */
  getDocuments(): KnowledgeDocument[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return data ? JSON.parse(data) : [];
  }

  /**
   * 获取知识库下的文档
   */
  getDocumentsByKnowledgeBaseId(knowledgeBaseId: string): KnowledgeDocument[] {
    const documents = this.getDocuments();
    return documents.filter((doc) => doc.knowledgeBaseId === knowledgeBaseId);
  }

  /**
   * 添加文档（模拟上传）
   */
  async addDocument(
    knowledgeBaseId: string,
    file: { name: string; size: number; type: string },
  ): Promise<KnowledgeDocument> {
    const response = await http.post(
      `${this.baseUrl}/${knowledgeBaseId}/documents`,
      file,
    );
    return response.data;
  }

  /**
   * 更新文档状态
   */
  updateDocumentStatus(
    documentId: string,
    status: KnowledgeDocument["status"],
    extra?: { charCount?: number; chunkCount?: number; errorMessage?: string },
  ): void {
    const documents = this.getDocuments();
    const index = documents.findIndex((doc) => doc.id === documentId);
    if (index === -1) return;

    documents[index] = {
      ...documents[index],
      status,
      ...extra,
      ...(status === "completed" ? { parsedAt: new Date().toISOString() } : {}),
    };

    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));

    // 更新知识库统计
    this.updateKnowledgeBaseStats(documents[index].knowledgeBaseId);
  }

  /**
   * 删除文档
   */
  deleteDocument(documentId: string): boolean {
    const documents = this.getDocuments();
    const doc = documents.find((d) => d.id === documentId);
    if (!doc) return false;

    const filtered = documents.filter((d) => d.id !== documentId);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filtered));

    // 更新知识库统计
    this.updateKnowledgeBaseStats(doc.knowledgeBaseId);

    return true;
  }

  /**
   * 更新知识库统计信息
   */
  private updateKnowledgeBaseStats(knowledgeBaseId: string): void {
    const documents = this.getDocumentsByKnowledgeBaseId(knowledgeBaseId);
    const completedDocs = documents.filter((doc) => doc.status === "completed");

    const stats = {
      fileCount: documents.length,
      charCount: completedDocs.reduce((sum, doc) => sum + doc.charCount, 0),
      chunkCount: completedDocs.reduce((sum, doc) => sum + doc.chunkCount, 0),
    };

    this.updateKnowledgeBase(
      knowledgeBaseId,
      stats as UpdateKnowledgeBaseRequest,
    );
  }

  // ==================== 文档详情（切片） ====================

  /**
   * 获取文档详情
   */
  getDocumentDetail(documentId: string): DocumentDetail | null {
    if (typeof window === "undefined") return null;
    const key = `document_detail_${documentId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * 保存文档详情
   */
  saveDocumentDetail(documentId: string, detail: DocumentDetail): void {
    const key = `document_detail_${documentId}`;
    localStorage.setItem(key, JSON.stringify(detail));
  }

  // ==================== 命中测试 ====================

  /**
   * 命中测试（简单关键词匹配）
   */
  hitTest(knowledgeBaseId: string, query: string): HitTestResult[] {
    const documents = this.getDocumentsByKnowledgeBaseId(knowledgeBaseId);
    const results: HitTestResult[] = [];

    for (const doc of documents) {
      const detail = this.getDocumentDetail(doc.id);
      if (!detail) continue;

      for (const chunk of detail.chunks) {
        // 简单的关键词匹配
        const lowerContent = chunk.content.toLowerCase();
        const lowerQuery = query.toLowerCase();

        if (lowerContent.includes(lowerQuery)) {
          // 计算简单的相似度分数
          const occurrences = (
            lowerContent.match(new RegExp(lowerQuery, "g")) || []
          ).length;
          const score = Math.min(occurrences * 0.2, 1);

          results.push({
            chunk,
            score,
            matchedKeywords: [query],
          });
        }
      }
    }

    // 按分数排序
    return results.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  /**
   * 获取命中测试历史记录
   */
  getHitTestHistory(knowledgeBaseId: string): HitTestHistory[] {
    if (typeof window === "undefined") return [];
    const key = `hit_test_history_${knowledgeBaseId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  /**
   * 保存命中测试历史记录
   */
  saveHitTestHistory(knowledgeBaseId: string, history: HitTestHistory[]): void {
    const key = `hit_test_history_${knowledgeBaseId}`;
    localStorage.setItem(key, JSON.stringify(history));
  }

  /**
   * 追加命中测试历史记录
   */
  appendHitTestHistory(
    knowledgeBaseId: string,
    history: HitTestHistory,
    maxItems: number = 20,
  ): HitTestHistory[] {
    const current = this.getHitTestHistory(knowledgeBaseId);
    const next = [history, ...current].slice(0, maxItems);
    this.saveHitTestHistory(knowledgeBaseId, next);
    return next;
  }

  // ==================== 标签操作 ====================

  /**
   * 获取所有标签
   */
  getTags(): KnowledgeTag[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.TAGS);
    return data ? JSON.parse(data) : [];
  }

  /**
   * 创建标签
   */
  createTag(name: string, color: string): KnowledgeTag {
    const newTag: KnowledgeTag = {
      id: `tag_${Date.now()}`,
      name,
      color,
      count: 0,
    };

    const tags = this.getTags();
    tags.push(newTag);
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));

    return newTag;
  }

  /**
   * 删除标签
   */
  deleteTag(tagId: string): boolean {
    const tags = this.getTags();
    const filtered = tags.filter((t) => t.id !== tagId);
    if (filtered.length === tags.length) return false;

    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(filtered));
    return true;
  }
}

// 导出单例
export const knowledgeService = new KnowledgeService();
