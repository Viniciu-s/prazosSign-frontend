import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { apiConfig, buildApiUrl } from '../config/api.config';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();
  const isApiRequest = request.url.startsWith(apiConfig.baseUrl);
  const isLoginRequest = request.url === buildApiUrl(apiConfig.endpoints.login);

  if (!isApiRequest || isLoginRequest || !accessToken) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    })
  );
};
