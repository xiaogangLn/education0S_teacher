// packages/shared/src/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { notifyAuthExpired } from './authExpired';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

function unwrapEnvelope(body: any): ApiResponse {
  if (!body || typeof body !== 'object') {
    return { code: 0, message: 'success', data: body, timestamp: new Date().toISOString() };
  }
  if (body.data && typeof body.data === 'object' && 'code' in body.data && 'data' in body.data) {
    return body.data as ApiResponse;
  }
  if ('code' in body && 'data' in body) {
    return body as ApiResponse;
  }
  return { code: 0, message: 'success', data: body, timestamp: new Date().toISOString() };
}

function pickAccessToken(payload: any): string | undefined {
  return payload?.access_token || payload?.accessToken;
}

function normalizeApiErrorMessage(raw?: string, status?: number): string {
  const msg = String(raw || '').trim();
  if (/欠费|余额不足|insufficient[_\s-]?quota|billing|payment[_\s-]?required|账号欠费/i.test(msg)) {
    return msg || '模型服务欠费或余额不足，请联系管理员处理后再试';
  }
  if (
    /模型.*(不存在|未配置|无效|禁用|已删除|不可用)|model.*(not[_\s-]?found|missing|disabled|invalid|unavailable)/i.test(
      msg,
    )
  ) {
    return msg || '模型未配置或不可用，请联系管理员在后台配置有效模型';
  }
  if (status === 402) {
    return msg || '模型服务欠费或余额不足，请联系管理员处理后再试';
  }
  if (!msg) {
    return '请求失败';
  }
  return msg;
}

class HttpClient {
  private instance: AxiosInstance;

  constructor(baseURL: string = '/api/v1') {
    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // FormData 需由浏览器自动带 multipart boundary，去掉默认 application/json
        if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
          if (typeof config.headers?.set === 'function') {
            config.headers.set('Content-Type', undefined as any);
          } else if (config.headers) {
            delete (config.headers as any)['Content-Type'];
            delete (config.headers as any)['content-type'];
          }
        }
        const url = String(config.url || '');
        if (url.includes('/knowledge/grading/photo') || url.includes('/knowledge/grading/tickets/')) {
          config.timeout = Math.max(Number(config.timeout) || 0, 180000);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response) => unwrapEnvelope(response.data),
      async (error) => {
        const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const url = String(original?.url || '');
        const skipRefresh =
          url.includes('/auth/login') ||
          url.includes('/auth/register') ||
          url.includes('/auth/refresh') ||
          url.includes('/grading/tickets/');

        if (error.response?.status === 401 && original && !original._retry && !skipRefresh) {
          original._retry = true;
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const refreshed = await this.instance.post('/auth/refresh', { refreshToken });
              const accessToken = pickAccessToken((refreshed as ApiResponse).data);
              if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
                original.headers = original.headers || {};
                original.headers.Authorization = `Bearer ${accessToken}`;
                return this.instance.request(original);
              }
            } catch {
              // fall through
            }
          }
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          notifyAuthExpired();
        }

        const timedOut =
          error.code === 'ECONNABORTED' || /timeout/i.test(String(error.message || ''));
        const isGradingPhoto =
          String(original?.url || '').includes('/knowledge/grading/photo') ||
          String(original?.url || '').includes('/knowledge/grading/tickets/');
        const apiMessage = normalizeApiErrorMessage(
          timedOut && isGradingPhoto
            ? '批改耗时较长，请稍后在批改记录中查看结果'
            : error.response?.data?.message ||
                error.response?.data?.data?.message ||
                error.message,
          error.response?.status,
        );
        return Promise.reject(new Error(apiMessage));
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config);
  }

  createEventSource(url: string): EventSource {
    const fullUrl = `${this.instance.defaults.baseURL}${url}`;
    return new EventSource(fullUrl);
  }

  async download(url: string, data?: any, fileName?: string): Promise<void> {
    const response = await this.instance.post(url, data, { responseType: 'blob' });
    const blob = new Blob([(response as any).data ?? response]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

export const httpClient = new HttpClient(import.meta.env.VITE_API_BASE_URL || '/api/v1');
export default httpClient;
