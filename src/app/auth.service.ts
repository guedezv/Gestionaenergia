import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Define la URL base de tu API.
  private apiUrl = 'http://66.29.140.76:8000';

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: { username: string, password: string }): Observable<any> {
    const loginUrl = `${this.apiUrl}/api/v1/auth/login`;

    const body = new HttpParams()
      .set('username', credentials.username)
      .set('password', credentials.password)
      .set('grant_type', 'password');

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(loginUrl, body.toString(), { headers });
  }

  /**
   * Elimina el token de sesión y redirige al usuario a la página de login.
   */
  logout(): void {
    // Elimina el token de acceso del almacenamiento local.
    localStorage.removeItem('access_token');
    
    // Redirige al usuario a la página de login.
    this.router.navigate(['/login']);
  }
}