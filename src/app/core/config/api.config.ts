export const apiConfig = {
  baseUrl: '',
  developmentTargetUrl: 'http://localhost:8081',
  endpoints: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password'
  }
} as const;

export function buildApiUrl(path: string): string {
  return `${apiConfig.baseUrl}${path}`;
}
