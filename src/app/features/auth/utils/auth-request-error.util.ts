import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../../../shared/models/auth.models';

interface AuthRequestErrorMessages {
  badRequest?: string;
  conflict?: string;
  fallback?: string;
  network?: string;
  unauthorized?: string;
}

const DEFAULT_MESSAGES: Required<AuthRequestErrorMessages> = {
  badRequest: 'Confira os dados informados e tente novamente.',
  conflict: 'Não foi possível concluir a solicitação.',
  fallback: 'Não foi possível processar sua solicitação agora.',
  network: 'Não foi possível conectar ao servidor no momento.',
  unauthorized: 'Credenciais inválidas.'
};

export function getAuthRequestErrorMessage(
  error: unknown,
  messages: AuthRequestErrorMessages = {}
): string {
  const resolvedMessages = {
    ...DEFAULT_MESSAGES,
    ...messages
  };

  if (!(error instanceof HttpErrorResponse)) {
    return resolvedMessages.fallback;
  }

  if (error.status === 0) {
    return resolvedMessages.network;
  }

  const errorBody = error.error as ApiErrorResponse | string | null;

  if (error.status === 400) {
    return extractValidationMessage(errorBody) ?? resolvedMessages.badRequest;
  }

  if (error.status === 401) {
    return extractMessage(errorBody) ?? resolvedMessages.unauthorized;
  }

  if (error.status === 409) {
    return extractMessage(errorBody) ?? resolvedMessages.conflict;
  }

  return extractMessage(errorBody) ?? resolvedMessages.fallback;
}

function extractValidationMessage(errorBody: ApiErrorResponse | string | null): string | null {
  if (!errorBody || typeof errorBody === 'string') {
    return typeof errorBody === 'string' && errorBody.trim() ? errorBody : null;
  }

  const fieldErrors = errorBody.errors;

  if (!fieldErrors) {
    return extractMessage(errorBody);
  }

  const firstError = Object.values(fieldErrors)[0];

  if (Array.isArray(firstError)) {
    return firstError[0] ?? null;
  }

  return firstError ?? null;
}

function extractMessage(errorBody: ApiErrorResponse | string | null): string | null {
  if (!errorBody) {
    return null;
  }

  if (typeof errorBody === 'string') {
    return errorBody.trim() || null;
  }

  return errorBody.message ?? errorBody.error ?? null;
}
