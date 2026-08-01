import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly mode = signal<AuthMode>('login');
  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    lembrar: [false]
  });

  readonly registerForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  private returnUrl(): string | null {
    return this.route.snapshot.queryParamMap.get('returnUrl');
  }

  setMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    this.errorMessage.set(null);
    this.successMessage.set('Em breve: recuperação de senha.');
  }

  onGoogleLogin(): void {
    this.errorMessage.set(null);
    this.successMessage.set('Login com Google será liberado em breve.');
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { email, senha } = this.loginForm.getRawValue();

    this.authService.login({ email, senha }).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.authService.redirectAfterLogin(response.role, this.returnUrl());
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Não foi possível entrar. Verifique seus dados.');
      }
    });
  }

  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = this.registerForm.getRawValue();

    this.authService.register(payload).subscribe({
      next: () => {
        this.authService.login({ email: payload.email, senha: payload.senha }).subscribe({
          next: (response) => {
            this.loading.set(false);
            this.authService.redirectAfterLogin(response.role, this.returnUrl());
          },
          error: () => {
            this.loading.set(false);
            this.setMode('login');
            this.successMessage.set('Cadastro feito. Entre com seu e-mail e senha.');
            this.loginForm.patchValue({ email: payload.email });
          }
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Não foi possível cadastrar.');
      }
    });
  }
}
