import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 *  Auth guard básico (login)
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.user || !auth.token) {
    router.navigate(['/login']);
    return false;
  }

  const token = auth.token;
  const expiration = JSON.parse(atob(token.split('.')[1])).exp;

  if (Date.now() / 1000 > expiration) {
    auth.logout();
    router.navigate(['/login']);
    return false;
  }

  return true;
};

/**
 *  Bloquea si el usuario no completó email
 */
export const emailCompleteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.user && auth.user.email?.includes('@facebook.local')) {
    router.navigate(['/complete-email']);
    return false;
  }

  return true;
};
