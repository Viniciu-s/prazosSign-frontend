import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../shared/models/auth.models';
import { AuthShellComponent } from '../../components/auth-shell/auth-shell.component';
import { matchingFieldsValidator } from '../../utils/auth-form.validators';
import { getAuthRequestErrorMessage } from '../../utils/auth-request-error.util';

@Component({
  selector: 'app-register-page',
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
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterPageComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isSubmitting = signal(false);
  protected readonly backendError = signal<string | null>(null);
  protected readonly currentYear = new Date().getFullYear();
  protected readonly registerForm = this.formBuilder.group(
    {
      name: this.formBuilder.control('', [Validators.required]),
      email: this.formBuilder.control('', [Validators.required, Validators.email]),
      password: this.formBuilder.control('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: this.formBuilder.control('', [Validators.required])
    },
    {
      validators: [matchingFieldsValidator('password', 'confirmPassword')]
    }
  );

  protected submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.backendError.set(null);
    this.isSubmitting.set(true);

    const { confirmPassword, ...payload } = this.registerForm.getRawValue();
    void confirmPassword;

    this.authService
      .register(payload as RegisterRequest)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Conta criada com sucesso.', 'Fechar', {
            duration: 3200
          });

          void this.router.navigate(['/dashboard']);
        },
        error: (error: unknown) => {
          const message = getAuthRequestErrorMessage(error, {
            conflict: 'Este e-mail já está cadastrado.',
            fallback: 'Não foi possível criar sua conta agora.'
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

    if (control.hasError('email')) {
      return 'Informe um e-mail válido.';
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
