import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Rol {
  Id: string | number;
  Nombre: string;
  Active?: boolean;
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  private baseUrl = `${environment.apiBase}/roles`;

  constructor(private http: HttpClient) {}

  private authHeaders(): { headers: HttpHeaders } {
    const token  = localStorage.getItem('access_token') || '';
    const userId = localStorage.getItem('user_id') || localStorage.getItem('userId') || '';
    let headers = new HttpHeaders();
    if (token)  headers = headers.set('Authorization', `Bearer ${token}`);
    if (userId) headers = headers.set('X-User-Id', userId);
    return { headers };
  }

  /** LISTAR */
  getRoles(): Observable<Rol[]> {
    return this.http.get<any>(this.baseUrl, this.authHeaders()).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.data ?? res?.Roles ?? []);
        return (list as any[]).map(this.normalizeRol);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /** OBTENER POR ID */
  getRolById(id: string | number): Observable<Rol> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, this.authHeaders()).pipe(
      map(res => this.normalizeRol(res)),
      catchError(err => throwError(() => err))
    );
  }

  /** CREAR ROL (POST /roles) – body { Name } */
  createRole(name: string): Observable<Rol> {
    return this.http.post<any>(this.baseUrl, { Name: name }, this.authHeaders()).pipe(
      map(res => this.normalizeRol(res)),
      catchError(err => throwError(() => err))
    );
  }

  /** RENOBRAR (PUT /roles/{id}) – body { Name } */
  renameRole(id: string | number, newName: string): Observable<Rol> {
    return this.http
      .put<any>(`${this.baseUrl}/${id}`, { Name: newName }, this.authHeaders())
      .pipe(
        map(res => this.normalizeRol(res)),
        catchError(err => throwError(() => err))
      );
  }

  /** ELIMINAR */
  deleteRole(id: string | number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`, this.authHeaders())
      .pipe(catchError(err => throwError(() => err)));
  }

  /** Normalización tolerante */
  private normalizeRol = (r: any): Rol => ({
    Id: r?.Id ?? r?.id ?? r?.ID ?? '',
    Nombre: r?.Nombre ?? r?.['name'] ?? r?.['Name'] ?? '',
    Active: r?.Active ?? r?.Activo ?? r?.active,
    ...r
  });
}
