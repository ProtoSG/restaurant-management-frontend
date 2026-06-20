import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/ApiError';

export function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }

  if (axiosError.message) {
    return axiosError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Error inesperado al conectar con el servidor';
}
