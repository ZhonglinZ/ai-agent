import { useState, useEffect, useCallback } from "react";
import type { ApiResponse } from "@/lib/services/http";

// API 请求状态接口
interface UseApiState<T> {
  data: T | null; // 响应数据
  loading: boolean; // 加载状态
  error: string | null; // 错误信息
}

// Hook 配置选项
interface UseApiOptions {
  immediate?: boolean; // 是否立即执行
  onSuccess?: (data: any) => void; // 成功回调
  onError?: (error: string) => void; // 错误回调
}

/**
 * 通用 API 请求 Hook
 * 封装了加载状态、错误处理等通用逻辑
 */
export function useApi<T>(
  apiFunction: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {},
) {
  const { immediate = true, onSuccess, onError } = options;

  // 状态管理
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // 执行 API 请求
  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiFunction();

      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
        onSuccess?.(response.data);
      } else {
        const errorMsg = response.message || "请求失败";
        setState({
          data: null,
          loading: false,
          error: errorMsg,
        });
        onError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "网络错误";
      setState({
        data: null,
        loading: false,
        error: errorMsg,
      });
      onError?.(errorMsg);
    }
  }, [apiFunction, onSuccess, onError]);

  // 自动执行
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    refresh: execute, // 刷新数据的别名
  };
}

/**
 * 分页数据 Hook
 * 专门处理带分页的列表数据
 */
export function usePaginatedApi<T>(
  apiFunction: (
    params: any,
  ) => Promise<ApiResponse<{ list: T[]; total: number }>>,
  initialParams = { current: 1, pageSize: 10 },
) {
  const [params, setParams] = useState(initialParams);

  // 使用基础 API Hook
  const { data, loading, error, execute } = useApi(() => apiFunction(params), {
    immediate: true,
  });

  // 改变页码
  const changePage = useCallback((current: number, pageSize?: number) => {
    setParams((prev) => ({
      ...prev,
      current,
      pageSize: pageSize || prev.pageSize,
    }));
  }, []);

  // 改变查询参数（会重置到第一页）
  const changeParams = useCallback((newParams: Partial<typeof params>) => {
    setParams((prev) => ({ ...prev, ...newParams, current: 1 }));
  }, []);

  return {
    data: data?.list || [], // 数据列表
    total: data?.total || 0, // 总条数
    loading,
    error,
    params,
    changePage, // 翻页
    changeParams, // 改变查询条件
    refresh: execute, // 刷新
  };
}
