import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../../../shared/models/auth.models';

interface GroupRequestErrorMessages {
  badRequest?: string;
  fallback?: string;
  network?: string;
  notFound?: string;
  unauthorized?: string;
}

const DEFAULT_MESSAGES: Required<GroupRequestErrorMessages> = {
  badRequest: 'Confira o nome do grupo e tente novamente.',
  fallback: 'Nao foi possivel concluir a operacao com grupos agora.',
  network: 'Nao foi possivel conectar ao servidor no momento.',
  notFound: 'O grupo informado nao foi encontrado.',
  unauthorized: 'Sua sessao nao e valida para executar esta acao.'
};

export function getGroupRequestErrorMessage(
  error: unknown,
  messages: GroupRequestErrorMessages = {}
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

  if (error.status === 404) {
    return extractMessage(errorBody) ?? resolvedMessages.notFound;
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
