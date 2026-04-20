import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { ForgotPasswordRequest } from '../../../../shared/models/auth.models';
import { AuthShellComponent } from '../../components/auth-shell/auth-shell.component';
import { getAuthRequestErrorMessage } from '../../utils/auth-request-error.util';

@Component({
  selector: 'app-forgot-password-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    AuthShellComponent
  ],
  templateUrl: './forgot-password-page.component.html',
  styleUrl: './forgot-password-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordPageComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isSubmitting = signal(false);
  protected readonly backendError = signal<string | null>(null);
  protected readonly responseMessage = signal<string | null>(null);
  protected readonly resetToken = signal<string | null>(null);
  protected readonly currentYear = new Date().getFullYear();
  protected readonly forgotPasswordForm = this.formBuilder.group({
    email: this.formBuilder.control('', [Validators.required, Validators.email])
  });

  protected submit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.backendError.set(null);
    this.responseMessage.set(null);
    this.resetToken.set(null);
    this.isSubmitting.set(true);

    this.authService
      .forgotPassword(this.forgotPasswordForm.getRawValue() as ForgotPasswordRequest)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.responseMessage.set(response.message);
          this.resetToken.set(response.resetToken);

          this.snackBar.open('Solicitação enviada com sucesso.', 'Fechar', {
            duration: 3200
          });
        },
        error: (error: unknown) => {
          const message = getAuthRequestErrorMessage(error, {
            fallback: 'Não foi possível solicitar a redefinição agora.'
          });

          this.backendError.set(message);

          this.snackBar.open(message, 'Fechar', {
            duration: 4500
          });
        }
      });
  }

  protected getEmailErrorMessage(): string {
    const emailControl = this.forgotPasswordForm.controls.email;

    if (emailControl.hasError('required')) {
      return 'Campo obrigatório.';
    }

    if (emailControl.hasError('email')) {
      return 'Informe um e-mail válido.';
    }

    return '';
  }
}
