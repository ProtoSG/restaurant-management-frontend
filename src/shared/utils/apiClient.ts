import axios, { type AxiosInstance } from "axios";
import { API_URL } from "../Config";

interface FailedQueue {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

class ApiClient {
  private static instance: ApiClient;
  private api: AxiosInstance;
  private isRefreshing: boolean = false;
  private failedQueue: Array<FailedQueue> = [];

  private constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => this.api(originalRequest));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await this.api.post('/auth/refresh', {});
            this.processQueue(null);
            return this.api(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: unknown) {
    this.failedQueue.forEach(prom => {
      if (error) prom.reject(error);
      else prom.resolve();
    });
    this.failedQueue = [];
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public getClient(): AxiosInstance {
    return this.api;
  }
}

const apiClientInstance = ApiClient.getInstance();
const defaultApiClient = apiClientInstance.getClient();

export default defaultApiClient;
