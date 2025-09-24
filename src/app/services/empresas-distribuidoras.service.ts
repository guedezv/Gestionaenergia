// src/app/services/empresas-distribuidoras.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EmpresaDistribuidora {
  Id: number | string;
  Nombre: string;
  RUT?: string;
  Energetico?: string;
  EnergeticoId?: number;
  Active?: boolean;
  ComunaIds?: number[];
  [k: string]: any;
}

export interface Localidad {
  Id: number;
  Nombre: string;
}

export interface Energetico {
  Id: number;
  Nombre: string;
}

export interface CreateEmpresaPayload {
  Nombre: string;
  RUT?: string;
  EnergeticoId: number;
  ComunaIds: number[];
}

export interface UpdateEmpresaPayload extends CreateEmpresaPayload {
  Active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class EmpresasDistribuidorasService {
  private baseUrl        = `${environment.apiBase}/empresas-distribuidoras`;
  private regionesUrl    = `${environment.apiBase}/regiones`;
  private comunasUrl     = `${environment.apiBase}/comunas`;
  private energeticosUrl = `${environment.apiBase}/energeticos`;

  constructor(private http: HttpClient) {}

  // ---- helpers ----
  private authOptions(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token') || '';
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return { headers };
  }

  private toParamVal(v: any): string {
    if (typeof v === 'boolean') return String(v);
    if (v === null || v === undefined) return '';
    return String(v);
  }

  // Normalizador tolerante
  private normalize = (e: any): EmpresaDistribuidora => ({
    Id: e?.Id ?? e?.id ?? e?.ID ?? '',
    Nombre: e?.Nombre ?? e?.nombre ?? e?.Name ?? '',
    RUT: e?.RUT ?? e?.rut,
    EnergeticoId: e?.EnergeticoId ?? e?.energeticoId,
    Energetico:
      e?.Energetico?.Nombre ??
      e?.EnergeticoNombre ??
      e?.Energetico ??
      '',
    Active: e?.Active ?? e?.Activo ?? e?.active,
    ComunaIds: e?.ComunaIds ?? e?.comunas ?? [],
    ...e
  });

  // ================== LISTAR ==================
  /**
   * Lista empresas con paginación y filtros.
   * Devuelve siempre { items, total }.
   */
  listEmpresas(opts: {
    q?: string | null;
    page?: number;
    pageSize?: number;
    energeticoId?: number | null;
    comunaId?: number | null;
    active?: boolean | null;
  } = {}): Observable<{ items: EmpresaDistribuidora[]; total: number }> {
    const {
      q = null,
      page = 1,
      pageSize = 10,
      energeticoId = null,
      comunaId = null,
      active = true
    } = opts;

    let params = new HttpParams()
      .set('page', String(page))
      .set('page_size', String(pageSize));

    if (q)                 params = params.set('q', q);
    if (energeticoId != null) params = params.set('EnergeticoId', String(energeticoId));
    if (comunaId != null)     params = params.set('ComunaId', String(comunaId));
    if (active != null)       params = params.set('active', this.toParamVal(active));

    return this.http.get<any>(this.baseUrl, { params, ...this.authOptions() }).pipe(
      map(res => {
        const data  = Array.isArray(res) ? res : (res?.data ?? []);
        const total = Array.isArray(res) ? data.length : (res?.total ?? data.length);
        return { items: (data as any[]).map(this.normalize), total };
      }),
      catchError(err => throwError(() => err))
    );
  }

  // ================== CRUD ==================
  getEmpresaById(id: number | string): Observable<EmpresaDistribuidora> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, this.authOptions()).pipe(
      map(res => this.normalize(res)),
      catchError(err => throwError(() => err))
    );
  }

  createEmpresa(payload: CreateEmpresaPayload): Observable<EmpresaDistribuidora> {
    return this.http.post<any>(this.baseUrl, payload, this.authOptions()).pipe(
      map(res => this.normalize(res)),
      catchError(err => throwError(() => err))
    );
  }

  updateEmpresa(id: number | string, payload: UpdateEmpresaPayload): Observable<EmpresaDistribuidora> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload, this.authOptions()).pipe(
      map(res => this.normalize(res)),
      catchError(err => throwError(() => err))
    );
  }

  deleteEmpresa(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.authOptions()).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // ================== CATÁLOGOS ==================
  /** Energeticos para selects */
  getEnergeticos(): Observable<Energetico[]> {
    const params = new HttpParams()
      .set('page', '1')
      .set('page_size', '200');

    return this.http.get<any>(this.energeticosUrl, { params, ...this.authOptions() }).pipe(
      map(res => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        return (data as any[]).map(e => ({
          Id: e?.Id ?? e?.id,
          Nombre: e?.Nombre ?? e?.nombre ?? ''
        }));
      }),
      catchError(err => throwError(() => err))
    );
  }

  /** Regiones del país */
  getRegiones(): Observable<Localidad[]> {
    return this.http.get<any>(this.regionesUrl, this.authOptions()).pipe(
      map(res => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        return (data as any[]).map(r => ({
          Id: r?.Id ?? r?.id,
          Nombre: r?.Nombre ?? r?.nombre ?? ''
        }));
      }),
      catchError(err => throwError(() => err))
    );
  }

  /** Comunas por región (según endpoint nuevo) */
  getComunasByRegionId(regionId: number): Observable<Localidad[]> {
    return this.http.get<any>(`${this.comunasUrl}/byRegionId/${regionId}`, this.authOptions()).pipe(
      map(res => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        return (data as any[]).map(c => ({
          Id: c?.Id ?? c?.id,
          Nombre: c?.Nombre ?? c?.nombre ?? ''
        }));
      }),
      catchError(err => throwError(() => err))
    );
  }
}
