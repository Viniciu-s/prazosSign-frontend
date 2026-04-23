import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, finalize } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import {
  DashboardSidebarComponent,
  DashboardSidebarItem
} from '../../components/dashboard-sidebar/dashboard-sidebar.component';

type SidebarDefinition = {
  readonly label: string;
  readonly description: string;
  readonly route: string;
};

@Component({
  selector: 'app-dashboard-layout-page',
  imports: [RouterOutlet, MatSnackBarModule, DashboardSidebarComponent],
  templateUrl: './dashboard-layout-page.component.html',
  styleUrl: './dashboard-layout-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardLayoutPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sidebarDefinitions: readonly SidebarDefinition[] = [
    {
      label: 'Home',
      description: 'Visao geral do workspace',
      route: '/dashboard'
    },
    {
      label: 'Grupos',
      description: 'Pastas e times de trabalho',
      route: '/groups'
    },
    {
      label: 'Documentos',
      description: 'Biblioteca completa',
      route: '/documents'
    },
    {
      label: 'Pendentes',
      description: 'Acoes aguardando assinatura',
      route: '/pending'
    },
    {
      label: 'Perfil',
      description: 'Dados e preferencias',
      route: '/profile'
    }
  ];

  protected readonly user = this.authService.user;
  protected readonly isLoggingOut = signal(false);
  protected readonly currentUrl = signal(this.router.url);
  protected readonly sidebarItems = computed<readonly DashboardSidebarItem[]>(() =>
    this.sidebarDefinitions.map((item) => ({
      label: item.label,
      description: item.description,
      active: this.isRouteActive(item.route)
    }))
  );

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.currentUrl.set((event as NavigationEnd).urlAfterRedirects);
      });
  }

  protected handleSidebarItemClick(label: string): void {
    const target = this.sidebarDefinitions.find((item) => item.label === label);

    if (!target || this.isRouteActive(target.route)) {
      return;
    }

    void this.router.navigateByUrl(target.route);
  }

  protected logout(): void {
    this.isLoggingOut.set(true);

    this.authService
      .logout()
      .pipe(
        finalize(() => this.isLoggingOut.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.snackBar.open('Sessao encerrada.', 'Fechar', {
          duration: 3000
        });

        void this.router.navigate(['/login']);
      });
  }

  private isRouteActive(route: string): boolean {
    const currentUrl = this.currentUrl();
    return currentUrl === route || currentUrl.startsWith(`${route}/`);
  }
}
