export const apiConfig = {
  baseUrl: '',
  developmentTargetUrl: 'http://localhost:8081',
  endpoints: {
    login: '/auth/login',
    logout: '/auth/logout'
  }
} as const;

export function buildApiUrl(path: string): string {
  return `${apiConfig.baseUrl}${path}`;
}
