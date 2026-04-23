
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    // Auth is stored in localStorage, so SSR cannot know the real session on refresh.
    // Client rendering avoids the login/dashboard flash during hydration.
    renderMode: RenderMode.Client
  }
];
