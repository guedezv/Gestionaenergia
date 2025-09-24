import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
  user?: { id?: string; username?: string; email?: string; nombres?: string; apellidos?: string; roles?: any[] };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiBase; // '/api/v1'

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    const url = `${this.apiUrl}/auth/login`;

    // ======== A) Intento 1: mínimo form-urlencoded (lo de Swagger) ========
    const form1 = new HttpParams()
      .set('grant_type', 'password')
      .set('username', credentials.username.trim())
      .set('password', credentials.password);

    const headersForm = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    });

    return this.http.post<LoginResponse>(url, form1.toString(), { headers: headersForm }).pipe(
      catchError(errA => {
        // ======== B) Intento 2: agregar scope/client_id/client_secret y Basic Auth si existen ========
        const { authClientId, authClientSecret, authScope } = environment;

        // si no hay client_id/secret configurados, salta a C)
        if (!authClientId && !authClientSecret && !authScope) {
          return this.tryJson(url, credentials); // C)
        }

        let form2 = new HttpParams()
          .set('grant_type', 'password')
          .set('username', credentials.username.trim())
          .set('password', credentials.password)
          .set('scope', authScope ?? '')
          .set('client_id', authClientId ?? '')
          .set('client_secret', authClientSecret ?? '');

        let headers2 = headersForm;
        if (authClientId && authClientSecret) {
          const basic = btoa(`${authClientId}:${authClientSecret}`);
          headers2 = headers2.set('Authorization', `Basic ${basic}`);
        }

        return this.http.post<LoginResponse>(url, form2.toString(), { headers: headers2 }).pipe(
          catchError(() => this.tryJson(url, credentials)) // ======== C) Intento 3: JSON ========
        );
      })
    );
  }

  private tryJson(url: string, credentials: { username: string; password: string }): Observable<LoginResponse> {
    const headersJson = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<LoginResponse>(url, {
      username: credentials.username,
      password: credentials.password
    }, { headers: headersJson });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }
}
