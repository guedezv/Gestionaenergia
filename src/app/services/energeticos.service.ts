import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Energetico {
  Id: number | string;
  Nombre: string;
  Icono?: string;
  Multiple?: boolean;
  PermiteMedidor?: boolean;
  Posicion?: number;
  PermitePotenciaSuministrada?: boolean;
  PermiteTipoTarifa?: boolean;
  Active?: boolean;
  [k: string]: any;
}

export interface CreateEnergeticoPayload {
  Nombre: string;
  Icono: string;
  Multiple: boolean;
  PermiteMedidor: boolean;
  Posicion: number;
  PermitePotenciaSuministrada: boolean;
  PermiteTipoTarifa: boolean;
}

export interface UpdateEnergeticoPayload extends CreateEnergeticoPayload {
  Active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class EnergeticosService {
  private baseUrl = `${environment.apiBase}/energeticos`;

  constructor(private http: HttpClient) {}

  private authHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token') || '';
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
    return { headers };
  }

  /** LIST: sólo agrega 'q' si NO está vacío (clave para el fallback) */
  listEnergeticos(opts: { q?: string | null; page?: number; pageSize?: number } = {}):
    Observable<{ items: Energetico[]; total: number }> {

    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 10;

    let params = new HttpParams()
      .set('page', String(page))
      .set('page_size', String(pageSize));

    const q = (opts.q ?? '').toString().trim();
    if (q) {
      // SOLO enviamos 'q' si trae algo
      params = params.set('q', q);
    }

    return this.http.get<any>(this.baseUrl, { params, ...this.authHeaders() }).pipe(
      map((res) => {
        const data = Array.isArray(res) ? res : (res?.data ?? res?.items ?? res?.results ?? []);
        const total = Array.isArray(res) ? data.length : (res?.total ?? res?.count ?? data.length);
        const items = (data as any[]).map(this.normalize);
        return { items, total };
      }),
      catchError((err) => throwError(() => err))
    );
  }

  /** GET por id (editar) */
  getEnergeticoById(id: number | string): Observable<Energetico> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, this.authHeaders()).pipe(
      map((res) => this.normalize(res)),
      catchError((err) => throwError(() => err))
    );
  }

  /** PUT (actualizar) */
  updateEnergetico(id: number | string, payload: UpdateEnergeticoPayload): Observable<Energetico> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload, this.authHeaders()).pipe(
      map((res) => this.normalize(res)),
      catchError((err) => throwError(() => err))
    );
  }

  /** POST (crear) */
  createEnergetico(payload: CreateEnergeticoPayload): Observable<Energetico> {
    return this.http.post<any>(this.baseUrl, payload, this.authHeaders()).pipe(
      map((res) => this.normalize(res)),
      catchError((err) => throwError(() => err))
    );
  }

  /** DELETE (si tu API lo permite) */
  deleteEnergetico(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.authHeaders()).pipe(
      catchError(err => throwError(() => err))
    );
  }

  private normalize = (e: any): Energetico => ({
    Id: e?.Id ?? e?.id ?? e?.ID ?? '',
    Nombre: e?.Nombre ?? e?.nombre ?? e?.Name ?? '',
    Icono: e?.Icono ?? e?.icon ?? '',
    Multiple: !!e?.Multiple,
    PermiteMedidor: !!e?.PermiteMedidor,
    Posicion: Number(e?.Posicion ?? 0),
    PermitePotenciaSuministrada: !!e?.PermitePotenciaSuministrada,
    PermiteTipoTarifa: !!e?.PermiteTipoTarifa,
    Active: e?.Active ?? e?.Activo ?? e?.active,
    ...e
  });
}
