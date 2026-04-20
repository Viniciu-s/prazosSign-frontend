import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { apiConfig } from '../../../../core/config/api.config';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [DatePipe, MatButtonModule, MatCardModule, MatSnackBarModule, MatToolbarModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly frontendApiPath = '/auth/*';
  protected readonly developmentTargetUrl = apiConfig.developmentTargetUrl;
  protected readonly isLoggingOut = signal(false);
  protected readonly session = this.authService.session;
  protected readonly user = this.authService.user;

  protected logout(): void {
    this.isLoggingOut.set(true);

    this.authService
      .logout()
      .pipe(
        finalize(() => this.isLoggingOut.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.snackBar.open('Sessão encerrada.', 'Fechar', {
          duration: 2500
        });

        void this.router.navigate(['/login']);
      });
  }
}
