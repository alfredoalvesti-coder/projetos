import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const session = auth.session();

  if (!session) {
    return true;
  }

  if (session.role === 'ADMIN') {
    return router.createUrlTree(['/admin/dashboard']);
  }

  return router.createUrlTree(['/home']);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const session = auth.session();

  if (session?.role === 'ADMIN') {
    return true;
  }

  if (session) {
    return router.createUrlTree(['/home']);
  }

  return router.createUrlTree(['/login']);
};

/** Bloqueia páginas de cliente quando o usuário é admin. */
export const clientOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) {
    return router.createUrlTree(['/admin/dashboard']);
  }

  return true;
};
