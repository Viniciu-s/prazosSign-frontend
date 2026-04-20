
import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { ForgotPasswordPageComponent } from './features/auth/pages/forgot-password-page/forgot-password-page.component';
import { LoginPageComponent } from './features/auth/pages/login-page/login-page.component';
import { RegisterPageComponent } from './features/auth/pages/register-page/register-page.component';
import { ResetPasswordPageComponent } from './features/auth/pages/reset-password-page/reset-password-page.component';
import { DashboardPageComponent } from './features/dashboard/pages/dashboard-page/dashboard-page.component';

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
    path: 'dashboard',
    canActivate: [authGuard],
    component: DashboardPageComponent
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
