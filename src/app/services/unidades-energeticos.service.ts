// src/app/unidades-energeticos/unidades-energeticos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UnidadMedida {
  Id: number | string;
  Nombre: string;
  Abreviatura?: string;
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class UnidadesEnergeticosService {
  private baseUrl = `${environment.apiBase}/unidades-medida`;

  constructor(private http: HttpClient) {}

  /** Headers (si tienes interceptor, esto es opcional) */
  private authHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token') || '';
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
    return { headers };
  }

  /** GET /api/v1/unidades-medida
   *  Lista con paginación y búsqueda opcional (q).
   *  Tolera respuestas: array directo o { data, total } / { Unidades } / { items } / { results }.
   */
  list(
    page = 1,
    pageSize = 50,
    q?: string | null
  ): Observable<{ data: UnidadMedida[]; total?: number }> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('page_size', String(pageSize));
    if (q != null && q !== '') params = params.set('q', q);

    return this.http.get<any>(this.baseUrl, { ...this.authHeaders(), params }).pipe(
      map((res) => {
        const raw =
          Array.isArray(res)
            ? res
            : (res?.data ?? res?.Unidades ?? res?.items ?? res?.results ?? []);
        const total = Array.isArray(res) ? undefined : (res?.total ?? res?.Total ?? undefined);
        const data = (raw as any[]).map(this.normalize);
        return { data, total };
      }),
      catchError((err) => throwError(() => err))
    );
  }

  /** GET /api/v1/unidades-medida/{id} */
  getUnidadById(id: number | string): Observable<UnidadMedida> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, this.authHeaders()).pipe(
      map((res) => this.normalize(res)),
      catchError((err) => throwError(() => err))
    );
  }

  /** POST /api/v1/unidades-medida
   *  (ADMIN) Crear unidad — según swagger solo recibe { Nombre }.
   */
  createUnidad(nombre: string): Observable<UnidadMedida> {
    return this.http
      .post<any>(this.baseUrl, { Nombre: nombre }, this.authHeaders())
      .pipe(
        map((res) => this.normalize(res)),
        catchError((err) => throwError(() => err))
      );
  }

  /** PUT /api/v1/unidades-medida/{id}
   *  (ADMIN) Actualizar nombre — el swagger muestra solo { Nombre }.
   */
  updateUnidadNombre(id: number | string, nombre: string): Observable<UnidadMedida> {
    return this.http
      .put<any>(`${this.baseUrl}/${id}`, { Nombre: nombre }, this.authHeaders())
      .pipe(
        map((res) => this.normalize(res)),
        catchError((err) => throwError(() => err))
      );
  }

  /** DELETE /api/v1/unidades-medida/{id} (opcional) */
  deleteUnidad(id: number | string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`, this.authHeaders())
      .pipe(catchError((err) => throwError(() => err)));
  }

  /** Normalizador defensivo de claves */
  private normalize = (u: any): UnidadMedida => ({
    Id: u?.Id ?? u?.id ?? u?.ID ?? '',
    Nombre: u?.Nombre ?? u?.nombre ?? u?.Name ?? u?.Descripcion ?? '',
    Abreviatura: u?.Abreviatura ?? u?.Abrev ?? u?.Abrv ?? u?.Sigla ?? u?.Simbolo ?? '',
    ...u
  });
}
