import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { ResetPasswordRequest } from '../../../../shared/models/auth.models';
import { AuthShellComponent } from '../../components/auth-shell/auth-shell.component';
import { matchingFieldsValidator } from '../../utils/auth-form.validators';
import { getAuthRequestErrorMessage } from '../../utils/auth-request-error.util';

@Component({
  selector: 'app-reset-password-page',
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
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordPageComponent implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isSubmitting = signal(false);
  protected readonly backendError = signal<string | null>(null);
  protected readonly currentYear = new Date().getFullYear();
  protected readonly resetPasswordForm = this.formBuilder.group(
    {
      token: this.formBuilder.control('', [Validators.required]),
      newPassword: this.formBuilder.control('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: this.formBuilder.control('', [Validators.required])
    },
    {
      validators: [matchingFieldsValidator('newPassword', 'confirmPassword')]
    }
  );

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.resetPasswordForm.controls.token.setValue(token);
    }
  }

  protected submit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.backendError.set(null);
    this.isSubmitting.set(true);

    const { confirmPassword, ...payload } = this.resetPasswordForm.getRawValue();
    void confirmPassword;

    this.authService
      .resetPassword(payload as ResetPasswordRequest)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.snackBar.open(response.message, 'Fechar', {
            duration: 3200
          });

          void this.router.navigate(['/login']);
        },
        error: (error: unknown) => {
          const message = getAuthRequestErrorMessage(error, {
            badRequest: 'Não foi possível redefinir a senha com os dados informados.',
            fallback: 'Não foi possível redefinir sua senha agora.'
          });

          this.backendError.set(message);

          this.snackBar.open(message, 'Fechar', {
            duration: 4500
          });
        }
      });
  }

  protected getFieldErrorMessage(control: AbstractControl | null): string {
    if (!control) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Campo obrigatório.';
    }

    if (control.hasError('minlength')) {
      return 'A senha deve ter pelo menos 8 caracteres.';
    }

    if (control.hasError('mismatch')) {
      return 'As senhas precisam ser iguais.';
    }

    return '';
  }
}
