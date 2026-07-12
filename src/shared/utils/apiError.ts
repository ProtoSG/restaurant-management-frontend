import axios from 'axios';
import type { ApiErrorResponse } from '../types/ApiError';

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    // El backend siempre responde con { message } en español (ver GlobalExceptionHandler).
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    // Sin response = nunca llegó al backend (red caída, timeout, CORS) —
    // acá error.message es texto crudo de Axios en inglés, no se lo mostramos al usuario.
    return 'No se pudo conectar con el servidor. Revisá tu conexión a internet.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Error inesperado al conectar con el servidor';
}
