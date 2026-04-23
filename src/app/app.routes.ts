
import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { ForgotPasswordPageComponent } from './features/auth/pages/forgot-password-page/forgot-password-page.component';
import { LoginPageComponent } from './features/auth/pages/login-page/login-page.component';
import { RegisterPageComponent } from './features/auth/pages/register-page/register-page.component';
import { ResetPasswordPageComponent } from './features/auth/pages/reset-password-page/reset-password-page.component';
import { DashboardLayoutPageComponent } from './features/dashboard/pages/dashboard-layout-page/dashboard-layout-page.component';
import { DashboardPageComponent } from './features/dashboard/pages/dashboard-page/dashboard-page.component';
import { SectionPlaceholderPageComponent } from './features/dashboard/pages/section-placeholder-page/section-placeholder-page.component';
import { GroupDocumentsPageComponent } from './features/groups/pages/group-documents-page/group-documents-page.component';
import { GroupsPageComponent } from './features/groups/pages/groups-page/groups-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    component: LoginPageComponent
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    component: RegisterPageComponent
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    component: ForgotPasswordPageComponent
  },
  {
    path: 'reset-password',
    canActivate: [guestGuard],
    component: ResetPasswordPageComponent
  },
  {
    path: '',
    canActivate: [authGuard],
    component: DashboardLayoutPageComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardPageComponent
      },
      {
        path: 'groups',
        component: GroupsPageComponent
      },
      {
        path: 'groups/:id',
        component: GroupDocumentsPageComponent
      },
      {
        path: 'documents',
        component: SectionPlaceholderPageComponent,
        data: {
          title: 'Documentos',
          description: 'A listagem completa de documentos sera implementada nesta rota.'
        }
      },
      {
        path: 'pending',
        component: SectionPlaceholderPageComponent,
        data: {
          title: 'Pendentes',
          description: 'Aqui vamos concentrar os documentos que ainda aguardam assinatura ou retorno.'
        }
      },
      {
        path: 'profile',
        component: SectionPlaceholderPageComponent,
        data: {
          title: 'Perfil',
          description: 'A area de dados da conta, preferencias e configuracoes sera ligada aqui.'
        }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
