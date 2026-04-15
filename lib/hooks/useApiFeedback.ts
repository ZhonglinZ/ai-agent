import { useCallback } from 'react';
import { message } from 'antd';
import type { ApiError } from '@/lib/types/api';

/**
 * API 错误处理 Hook
 * 
 * 自动从错误对象中提取消息并显示，无需每次手动指定错误文本
 * 
 * @example
 * ```tsx
 * const { showApiError, showApiSuccess } = useApiFeedback();
 * 
 * try {
 *   await api.saveData();
 *   showApiSuccess('保存成功'); // 或使用后端返回的消息
 * } catch (error) {
 *   showApiError(error); // 自动显示 error.message
 * }
 * ```
 */
export function useApiFeedback() {
  /**
   * 显示 API 错误消息
   * 自动从错误对象中提取 message，如果不存在则使用备用消息
   * 
   * @param error - 错误对象（应包含 message 属性）
   * @param fallbackMessage - 备用消息（当 error.message 不存在时使用）
   */
  const showApiError = useCallback(
    (error: unknown, fallbackMessage: string = '操作失败') => {
      let errorMessage = fallbackMessage;

      // 尝试从错误对象中提取消息
      if (error && typeof error === 'object') {
        const apiError = error as ApiError;
        
        // 优先使用后端返回的消息
        if (apiError.message) {
          errorMessage = apiError.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      message.error(errorMessage);

      // 开发环境下打印详细错误
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', error);
      }
    },
    []
  );

  /**
   * 显示 API 成功消息
   * 
   * @param successMessage - 成功消息（可选，如果不传则不显示）
   */
  const showApiSuccess = useCallback((successMessage?: string) => {
    if (successMessage) {
      message.success(successMessage);
    }
  }, []);

  /**
   * 显示 API 警告消息
   * 
   * @param warningMessage - 警告消息
   */
  const showApiWarning = useCallback((warningMessage: string = '请注意') => {
    message.warning(warningMessage);
  }, []);

  return {
    showApiError,
    showApiSuccess,
    showApiWarning,
  };
}
