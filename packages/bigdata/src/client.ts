/**
 * HTTP 客户端封装
 * 提供统一的请求处理、错误处理和认证
 */

import type { BigDataConfig } from './config';

export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(config: BigDataConfig) {
    this.baseUrl = config.javaServiceUrl || 'http://localhost:8080';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 发送 GET 请求
   */
  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    // 处理二进制响应
    if (contentType && contentType.includes('application/octet-stream')) {
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer) as unknown as T;
    }

    return response.json();
  }

  /**
   * 发送 POST 请求
   */
  async post<T>(path: string, body?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // 处理空响应
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    // 处理二进制响应（如文件下载）
    if (contentType && contentType.includes('application/octet-stream')) {
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer) as unknown as T;
    }

    return {} as T;
  }

  /**
   * 发送 DELETE 请求
   */
  async delete<T>(path: string): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // DELETE 请求可能返回空响应
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return {} as T;
  }

  /**
   * 构建 URL（包含查询参数）
   */
  private buildUrl(path: string, params?: Record<string, string>): string {
    // 如果 path 是绝对 URL，直接使用
    if (path.startsWith('http://') || path.startsWith('https://')) {
      const url = new URL(path);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }
      return url.toString();
    }
    
    // 相对路径，拼接 baseUrl
    const url = new URL(path, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return url.toString();
  }
}
