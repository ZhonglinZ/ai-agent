// Defaults shared by conversation editor and preview.
export const DEFAULT_OPENING_STATEMENT =
  "你好，我是你的合同审查助手，有什么可以帮你？";

export const MAX_SUGGESTED_QUESTIONS = 3;

export const DEFAULT_SUGGESTED_QUESTIONS = [
  "这份合同的违约条款是否严谨？",
  "合同中的权利是否明确？",
  "合同审查需要注意哪些法律风险？",
];

// Preserve defaults so callers can safely mutate the returned array.
export const getFallbackSuggestedQuestions = () =>
  [...DEFAULT_SUGGESTED_QUESTIONS].slice(0, MAX_SUGGESTED_QUESTIONS);

// Normalize and filter blanks for preview/quick-ask usage.
export const normalizeSuggestedQuestions = (questions?: string[]) => {
  const normalized = (questions ?? [])
    .map((question) => question.trim())
    .filter(Boolean);
  const limited = normalized.slice(0, MAX_SUGGESTED_QUESTIONS);
  return limited.length
    ? limited
    : [...DEFAULT_SUGGESTED_QUESTIONS].slice(0, MAX_SUGGESTED_QUESTIONS);
};
