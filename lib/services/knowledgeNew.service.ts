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
  private readonly baseUrl = "/knowledge";
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
  ): Promise<{ knowledgeBaseId: string }> {
    const response = await http.post(`${this.baseUrl}`, request);
    return response.data;
  }

  // /**
  //  * 更新知识库
  //  */
  // async updateKnowledgeBase(
  //   id: string,
  //   request: UpdateKnowledgeBaseRequest,
  // ): Promise<KnowledgeBase | null> {
  //   const response = await http.put(`${this.baseUrl}/${id}`, request);
  //   return response.data;
  // }

  /**
   * 删除知识库
   */
  async deleteKnowledgeBase(id: string): Promise<boolean> {
    const response = await http.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // /**
  //  * 搜索知识库
  //  */
  // async searchKnowledgeBases(keyword: string): Promise<KnowledgeBase[]> {
  //   const response = await http.get(`${this.baseUrl}/search`, {
  //     params: { keyword },
  //   });
  //   return response.data;
  // }

  // ==================== 文档操作 ====================
  /**
   * 获取知识库下的文档
   */
  async getDocumentsByKnowledgeBaseId(
    knowledgeBaseId: string,
  ): Promise<KnowledgeDocument[]> {
    const response = await http.get(
      `${this.baseUrl}/${knowledgeBaseId}/documents`,
    );
    return response.data;
  }

  /**
   * 添加文档（模拟上传）
   */
  async addDocument(
    knowledgeBaseId: string,
    file: { name: string; size: number; type: string; content: string },
  ): Promise<KnowledgeDocument> {
    const response = await http.post(
      `${this.baseUrl}/${knowledgeBaseId}/documents`,
      file,
    );
    return response.data;
  }

  // ==================== 文档详情（切片） ====================

  /**
   * 获取文档详情
   */
  async getDocumentDetail(documentId: string): Promise<DocumentDetail | null> {
    const response = await http.get(`${this.baseUrl}/documents/${documentId}`);
    return response.data;
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
   * 命中测试
   */
  async hitTest(
    knowledgeBaseId: string,
    query: string,
    topK: number = 5,
    scoreThreshold: number = 0.2,
  ): Promise<HitTestResult[]> {
    const response = await http.post(
      `${this.baseUrl}/${knowledgeBaseId}/search`,
      { query, topK, scoreThreshold },
    );
    return response.data;
  }
}

// 导出单例
export const knowledgeService = new KnowledgeService();
