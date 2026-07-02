import { APINodeData, KeyValuePair } from "../workflow/types";
import { resolveVariables } from "./variableResolver";

export type HttpExcuteResult = {
  body: unknown;
  status_code: number;
  headers: Record<string, string>;
};

function isEnabled(item: KeyValuePair) {
  return item.enabled !== false && item.key.trim() !== "";
}

function buildQuery(
  params: KeyValuePair[],
  variables: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  params.filter(isEnabled).forEach((item) => {
    search.append(item.key, resolveVariables(item.value, variables));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

function buildHeaders(
  data: APINodeData,
  variables: Record<string, unknown>,
): Record<string, string> {
  const headers: Record<string, string> = {};
  data.headers.filter(isEnabled).forEach((item) => {
    headers[item.key] = resolveVariables(item.value, variables);
  });
  if (data.authEnabled && data.authValue) {
    const authValue = resolveVariables(data.authValue, variables);
    if (data.authType === "bearer") {
      headers.Authorization = `Bearer ${authValue}`;
    } else if (data.authType === "basic") {
      headers.Authorization = `Basic ${Buffer.from(authValue).toString("base64")}`;
    } else if (data.authType === "api-key") {
      headers["X-API-Key"] = authValue;
    }
  }
  return headers;
}

function buildBody(
  data: APINodeData,
  variables: Record<string, unknown>,
): { body?: BodyInit; headers: Record<string, string> } {
  const extraHeaders: Record<string, string> = {};
  switch (data.bodyType) {
    case "json": {
      const json = resolveVariables(data.bodyJson || "{}", variables);
      extraHeaders["Content-Type"] = "application/json";
      return { body: json, headers: extraHeaders };
    }
    case "raw": {
      return {
        body: resolveVariables(data.bodyRaw || "", variables),
        headers: extraHeaders,
      };
    }
    case "x-www-form-urlencoded": {
      const search = new URLSearchParams();
      data.bodyFormData.filter(isEnabled).forEach((item) => {
        search.append(item.key, resolveVariables(item.value, variables));
      });
      extraHeaders["Content-Type"] = "application/x-www-form-urlencoded";
      return { body: search.toString(), headers: extraHeaders };
    }
    case "form-data": {
      const form = new FormData();
      data.bodyFormData.filter(isEnabled).forEach((item) => {
        form.append(item.key, resolveVariables(item.value, variables));
      });
      return { body: form, headers: extraHeaders };
    }
    default:
      return { headers: extraHeaders };
  }
}

function assertSafeUrl(url: string) {
  const parsed = new URL(url);
  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    host.endsWith(".local")
  ) {
    throw new Error("不允许访问内网地址");
  }
}

/**
 * 执行一次HTTP请求
 */
const fetchOnce = async (
  data: APINodeData,
  variables: Record<string, unknown>,
): Promise<HttpExcuteResult> => {
  const baseUrl = resolveVariables(data.url, variables);
  const url = `${baseUrl}${buildQuery(data.params, variables)}`;
  assertSafeUrl(url);

  const headers = buildHeaders(data, variables);
  const { body, headers: bodyHeaders } = buildBody(data, variables);

  const response = await fetch(url, {
    method: data.method,
    headers: { ...headers, ...bodyHeaders },
    body: ["GET", "HEAD"].includes(data.method) ? undefined : body,
    signal: AbortSignal.timeout((data.timeout || 120) * 1000),
  });

  const text = await response.text();
  let parsedBody: unknown = text;
  try {
    parsedBody = JSON.parse(text);
  } catch {
    // 非 JSON 保持字符串
  }
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });
  return {
    body: parsedBody,
    status_code: response.status,
    headers: responseHeaders,
  };
};

export async function runHttpRequest(
  data: APINodeData,
  variables: Record<string, unknown>,
): Promise<HttpExcuteResult> {
  const maxAttempts = Math.max(1, (data.retryCount ?? 0) + 1);
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetchOnce(data, variables);
      if (res.status_code >= 500 && attempt < maxAttempts) {
        continue;
      }

      return res;
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) {
        throw lastError;
      }
    }
  }
  throw lastError ?? new Error("HTTP request failed");
}
