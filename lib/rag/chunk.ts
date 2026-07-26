export type ChunkOptions = {
  chunkSize: number;
  chunkOverlap: number;
};

export type TextChunk = {
  content: string;
  index: number;
  startIndex: number;
  endIndex: number;
  charCount: number;
};

export function chunkText(text: string, options: ChunkOptions): TextChunk[] {
  const { chunkSize, chunkOverlap } = options;
  if (!text || chunkSize <= 0) {
    return [];
  }
  if (chunkOverlap >= chunkSize) {
    throw new Error("chunkOverlap must be less than chunkSize");
  }
  const chunks: TextChunk[] = [];
  const totalChars = text.length;
  let startIndex = 0;
  while (startIndex < totalChars) {
    const endIndex = Math.min(startIndex + chunkSize, totalChars);
    const content = text.slice(startIndex, endIndex);
    const index = chunks.length;
    const charCount = content.length;
    chunks.push({ content, index, startIndex, endIndex, charCount });
    if (endIndex === totalChars) {
      break;
    }
    startIndex = endIndex - chunkOverlap;
  }
  return chunks as TextChunk[];
}
