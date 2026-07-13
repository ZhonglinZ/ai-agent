export const LLM_RETRY_DEFAULTS = {
  /** 最多额外重试次数（不含第一次），共 1 + maxRetries 次尝试 */
  maxRetries: 3,
  /** 首次退避基数（毫秒） */
  baseMs: 1000,
  /** 退避上限（毫秒） */
  capMs: 16_000,
} as const;

/**
 * 指数退避：base * 2^attempt，加一点抖动，不超过 cap
 * attempt 从 0 开始（第 1 次失败后的等待）
 */
export function getBackoffDelayMs(
  attempt: number,
  baseMs = LLM_RETRY_DEFAULTS.baseMs,
  capMs = LLM_RETRY_DEFAULTS.capMs,
): number {
  const exp = Math.min(capMs, baseMs * 2 ** attempt);
  const jitter = Math.floor(Math.random() * 200);
  return exp + jitter;
}

/**
 * 判断错误是否值得重试
 * - 超时 / 网络中断 / 429 / 5xx → 可重试
 * - 400 / 鉴权 / 业务校验 → 不重试
 */
export function isRetryableError(error: unknown): boolean {
  if (!error) return false;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message: unknown }).message === "string"
        ? (error as { message: string }).message
        : String(error);
  const lower = message.toLowerCase();
  // 超时 / abort
  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("aborted") ||
    lower.includes("abort")
  ) {
    return true;
  }
  // 网络类
  if (
    lower.includes("network") ||
    lower.includes("fetch failed") ||
    lower.includes("econnreset") ||
    lower.includes("enotfound")
  ) {
    return true;
  }
  // HTTP 状态（message 或 ApiError.code）
  if (/\b429\b/.test(message) || lower.includes("too many requests")) {
    return true;
  }
  if (/\b5\d{2}\b/.test(message)) {
    return true;
  }
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code: unknown }).code
      : undefined;
  if (typeof code === "number" && (code === 429 || code >= 500)) {
    return true;
  }
  // 明确不可重试
  if (lower.includes("prompt") && lower.includes("空")) {
    return false;
  }
  if (
    /\b401\b/.test(message) ||
    /\b403\b/.test(message) ||
    /\b400\b/.test(message)
  ) {
    return false;
  }
  // 默认：未知错误也重试一次类别（可选）；这里偏保守，未知也重试
  return true;
}
