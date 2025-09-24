// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');
  const isLogin = req.url.includes('/auth/login');

  let authReq = req;
  if (!isLogin && token) {
    authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(authReq).pipe(
    catchError((err) => {
      if (err.status === 401 && !isLogin) {
        // Señales claras de token inválido/expirado:
        const www = (err.headers?.get?.('www-authenticate') || '').toLowerCase();
        const detail = (err.error?.detail || '').toString().toLowerCase();

        const tokenProblem =
          www.includes('bearer') ||
          detail.includes('not authenticated') ||
          detail.includes('token');

        if (tokenProblem) {
          // solo en este caso realmente te saco del sistema
          localStorage.removeItem('access_token');
          router.navigate(['/login']);
        }
        // si es “userId no presente” u otro error funcional, NO desloguees:
        // deja que el componente maneje el error (mostrar mensaje, etc.)
      }
      return throwError(() => err);
    })
  );
};
