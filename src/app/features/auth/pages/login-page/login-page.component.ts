import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../../../core/services/auth.service';
import { ApiErrorResponse, LoginRequest } from '../../../../shared/models/auth.models';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatToolbarModule
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isSubmitting = signal(false);
  protected readonly backendError = signal<string | null>(null);
  protected readonly currentYear = new Date().getFullYear();
  protected readonly loginForm = this.formBuilder.group({
    email: this.formBuilder.control('', [Validators.required, Validators.email]),
    password: this.formBuilder.control('', [Validators.required, Validators.minLength(8)])
  });

  protected submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.backendError.set(null);
    this.isSubmitting.set(true);

    const credentials: LoginRequest = this.loginForm.getRawValue();

    this.authService
      .login(credentials)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Login realizado com sucesso.', 'Fechar', {
            duration: 3000
          });

          const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') ?? '/dashboard';
          void this.router.navigateByUrl(redirectTo);
        },
        error: (error: unknown) => {
          const message = this.getRequestErrorMessage(error);
          this.backendError.set(message);

          this.snackBar.open(message, 'Fechar', {
            duration: 4500
          });
        }
      });
  }

  protected getFieldErrorMessage(control: FormControl<string>): string {
    if (control.hasError('required')) {
      return 'Campo obrigatório.';
    }

    if (control.hasError('email')) {
      return 'Informe um e-mail válido.';
    }

    if (control.hasError('minlength')) {
      return 'A senha deve ter pelo menos 8 caracteres.';
    }

    return '';
  }

  private getRequestErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Não foi possível realizar o login agora.';
    }

    if (error.status === 0) {
      return 'Não foi possível conectar ao servidor no momento.';
    }

    const errorBody = error.error as ApiErrorResponse | string | null;

    if (error.status === 401) {
      return this.extractErrorMessage(errorBody) ?? 'Credenciais inválidas.';
    }

    if (error.status === 400) {
      return this.extractValidationMessage(errorBody) ?? 'Confira os dados informados e tente novamente.';
    }

    return this.extractErrorMessage(errorBody) ?? 'Falha ao realizar login.';
  }

  private extractValidationMessage(errorBody: ApiErrorResponse | string | null): string | null {
    if (!errorBody || typeof errorBody === 'string') {
      return typeof errorBody === 'string' && errorBody.trim() ? errorBody : null;
    }

    const fieldErrors = errorBody.errors;

    if (!fieldErrors) {
      return errorBody.message ?? errorBody.error ?? null;
    }

    const firstError = Object.values(fieldErrors)[0];

    if (Array.isArray(firstError)) {
      return firstError[0] ?? null;
    }

    return firstError ?? null;
  }

  private extractErrorMessage(errorBody: ApiErrorResponse | string | null): string | null {
    if (!errorBody) {
      return null;
    }

    if (typeof errorBody === 'string') {
      return errorBody.trim() || null;
    }

    return errorBody.message ?? errorBody.error ?? null;
  }
}
