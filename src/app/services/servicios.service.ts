// src/app/services/servicios.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError, throwError, Observable } from 'rxjs';

export interface Servicio {
  Id: number | null;
  Nombre: string;
  [k: string]: any;
}

export interface CrearServicioPayload {
  Nombre: string;
  Identificador: string;
  ReportaPMG: boolean;
  InstitucionId: number;
}

@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private http = inject(HttpClient);

  /** Normaliza claves comunes de la API */
  private normalizeServicio = (s: any): Servicio => ({
    Id: s?.Id ?? s?.id ?? s?.ID ?? null,
    Nombre: s?.Nombre ?? s?.nombre ?? s?.name ?? '',
    ...s
  });

  /**
   * GET /api/v1/servicios/usuario   (paginado)
   * - Lee userId desde localStorage para header "X-User-Id" (requerido por tu backend)
   * - Solo envía InstitucionId si es > 0 (evita 422)
   */
 // src/app/services/servicios.service.ts
getServiciosDeUsuarioActual(
  page = 1,
  pageSize = 200,
  opts?: { InstitucionId?: number | null; Pmg?: boolean }
): Observable<Servicio[]> {

  const userId =
    localStorage.getItem('user_id') ||
    localStorage.getItem('userId') ||
    '';

  let headers = new HttpHeaders();
  if (userId) headers = headers.set('X-User-Id', userId);

  // 👇 clamp respetando el backend (1..200)
  const safeSize = Math.min(Math.max(1, Math.trunc(pageSize)), 200);

  let params = new HttpParams()
    .set('page', String(page))
    .set('page_size', String(safeSize));

  if (opts?.InstitucionId != null) params = params.set('InstitucionId', String(opts.InstitucionId));
  if (typeof opts?.Pmg === 'boolean') params = params.set('Pmg', String(opts.Pmg));

  return this.http.get<any>('/api/v1/servicios/usuario', { headers, params }).pipe(
    map(res => {
      const list = Array.isArray(res) ? res : (res?.Servicios ?? res?.data ?? []);
      return (list as any[]).map(this.normalizeServicio);
    })
  );
}
// ⭐ Agrega esto dentro de la clase ServiciosService
updateEstadoServicio(id: number, activo: boolean) {
  const userId =
    localStorage.getItem('user_id') ||
    localStorage.getItem('userId') || '';

  let headers = new HttpHeaders();
  if (userId) headers = headers.set('X-User-Id', userId);

  // Enviamos ambas claves por compatibilidad (Active/Activo)
  const body = { Active: activo, Activo: activo };

  return this['http'].patch<any>(`/api/v1/servicios/${id}/estado`, body, { headers });
}


  // ---------- CRUD que ya tenías ----------
  createServicio(payload: CrearServicioPayload): Observable<Servicio> {
    const userId =
      localStorage.getItem('user_id') ||
      localStorage.getItem('userId') ||
      '';
    let headers = new HttpHeaders();
    if (userId) headers = headers.set('X-User-Id', userId);

    return this.http.post<any>('/api/v1/servicios', payload, { headers }).pipe(
      map((res) => this.normalizeServicio(res)),
      catchError((err) => throwError(() => err))
    );
  }

  getServicioById(id: number): Observable<any> {
    return this.http.get<any>(`/api/v1/servicios/${id}`);
  }

  updateServicio(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`/api/v1/servicios/${id}`, payload);
  }
}
