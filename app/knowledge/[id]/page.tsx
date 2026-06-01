// app/knowledge/[id]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Empty, Segmented, Space, Tag, Typography } from "antd";
import { ArrowLeftOutlined, FileTextOutlined } from "@ant-design/icons";
import { MainLayout } from "@/components/layouts/MainLayout";
import { DocumentPreview } from "@/components/knowledge/DocumentPreview";
import { ChapterTree } from "@/components/knowledge/ChapterTree";
import { ChunkList } from "@/components/knowledge/ChunkList";
import { knowledgeService } from "@/lib/services/knowledge.service";
import { initMockData } from "@/lib/services/knowledge.mock";
import type {
  DocumentDetail,
  KnowledgeBase,
  KnowledgeDocument,
  DocumentChunk,
} from "@/lib/types/knowledge";

const { Text } = Typography;

const statusColorMap: Record<string, string> = {
  uploading: "blue",
  parsing: "gold",
  chunking: "purple",
  completed: "green",
  error: "red",
};

export default function KnowledgeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const knowledgeBaseId = Array.isArray(params?.id)
    ? params?.id[0]
    : params?.id;
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(
    null,
  );
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [chunkKeyword, setChunkKeyword] = useState("");
  const [isContentHidden, setIsContentHidden] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [selectedChunkId, setSelectedChunkId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"segments" | "hitTest">(
    "segments",
  );

  useEffect(() => {
    if (!knowledgeBaseId) return;
    initMockData();

    const base = knowledgeService.getKnowledgeBaseById(knowledgeBaseId);
    const docs =
      knowledgeService.getDocumentsByKnowledgeBaseId(knowledgeBaseId);
    setKnowledgeBase(base);
    setDocuments(docs);
    setSelectedDocId((prev) => prev || docs[0]?.id || "");
  }, [knowledgeBaseId]);

  useEffect(() => {
    if (!selectedDocId) {
      setDetail(null);
      return;
    }
    const nextDetail = knowledgeService.getDocumentDetail(selectedDocId);
    setDetail(nextDetail);
    setSelectedChapterId("");
    setSelectedChunkId("");
  }, [selectedDocId]);

  const selectedDocument = documents.find((doc) => doc.id === selectedDocId);
  const selectedChunk = detail?.chunks.find(
    (chunk) => chunk.id === selectedChunkId,
  );

  if (!knowledgeBaseId || !knowledgeBase) {
    return (
      <MainLayout>
        <Empty description="知识库不存在或已被删除" />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-3 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/knowledge/list")}
            />
            <div className="min-w-0">
              <div className="text-lg font-semibold text-gray-900 truncate">
                {knowledgeBase.name}
              </div>
              <div className="text-gray-500 text-sm">文件分段与目录树</div>
            </div>
          </div>
          <div className="flex flex-1 justify-center">
            <Segmented
              size="middle"
              value={activeTab}
              onChange={(value) =>
                setActiveTab(value as "segments" | "hitTest")
              }
              options={[
                { label: "文件分段", value: "segments" },
                { label: "命中测试", value: "hitTest" },
              ]}
            />
          </div>
        </div>
      </div>

      {activeTab === "segments" && (
        <div className="mb-4 flex items-center justify-between gap-3 bg-white px-3 py-2 shadow-sm">
          <Space size="small" className="min-w-0">
            {/* <div className="flex items-center gap-2">
              <FileTextOutlined className="text-gray-500" />
              <Text type="secondary">文件</Text>
            </div> */}
            <Text className="text-gray-800 max-w-[360px]" ellipsis>
              {selectedDocument?.name || "暂无文件"}
            </Text>
            <Text type="secondary" className="text-xs">
              文件数: {knowledgeBase.fileCount} · 字符数:{" "}
              {knowledgeBase.charCount} · 切片数: {knowledgeBase.chunkCount}
            </Text>
            {/* {selectedDocument && (
              <Tag color={statusColorMap[selectedDocument.status] || 'default'}>
                {selectedDocument.status}
            )} */}
          </Space>
          <Space size="small" className="shrink-0">
            <Button onClick={() => setIsContentHidden((prev) => !prev)}>
              {isContentHidden ? "显示原文文件" : "隐藏原文文件"}
            </Button>
          </Space>
        </div>
      )}

      {documents.length === 0 ? (
        <Empty description="暂无文档，请先上传文件" />
      ) : activeTab === "segments" ? (
        <div
          className="gap-4"
          style={{
            display: "grid",
            gridTemplateColumns: isContentHidden ? "4fr 8fr" : "6fr 3fr 3fr",
          }}
        >
          {!isContentHidden && (
            <div className="min-h-[540px] min-w-0">
              <DocumentPreview
                title={selectedDocument?.name || "原文"}
                content={detail?.content}
                highlightText={selectedChunk?.content}
                highlightRange={
                  selectedChunk
                    ? {
                        startIndex: selectedChunk.startIndex,
                        endIndex: selectedChunk.endIndex,
                      }
                    : undefined
                }
                enableScroll={!chunkKeyword.trim()}
              />
            </div>
          )}
          <div className="min-h-[540px] min-w-0">
            <ChapterTree
              chapters={detail?.chapters || []}
              selectedChapterId={selectedChapterId}
              onSelectChapter={(chapterId: string) => {
                setSelectedChapterId(chapterId);
                const firstChunk = detail?.chunks.find(
                  (chunk) => chunk.chapterId === chapterId,
                );
                if (firstChunk) {
                  setSelectedChunkId(firstChunk.id);
                }
              }}
            />
          </div>
          <div className="min-h-[540px] min-w-0">
            <ChunkList
              chunks={detail?.chunks || []}
              keyword={chunkKeyword}
              onKeywordChange={setChunkKeyword}
              selectedChunkId={selectedChunkId}
              selectedChapterId={selectedChapterId}
              onSelectChunk={(chunk: DocumentChunk) => {
                setSelectedChunkId(chunk.id);
                if (chunk.chapterId) {
                  setSelectedChapterId(chunk.chapterId);
                }
              }}
            />
          </div>
        </div>
      ) : (
        <Empty description="命中测试将在第 20 章实现" />
      )}
    </MainLayout>
  );
}
