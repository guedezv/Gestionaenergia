// src/app/services/inmuebles.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Direccion {
  Id?: number;
  Calle?: string;
  Numero?: string;
  DireccionCompleta?: string;
  RegionId?: number;
  ProvinciaId?: number;
  ComunaId?: number;
  [k: string]: any;
}

export interface Inmueble {
  Id: number | string;
  Nombre: string;
  TipoInmueble?: number | string;
  ServicioId?: number | string;
  Active?: boolean;
  RegionId?: number | string;
  ComunaId?: number | string;
  Direccion?: Direccion;
  [k: string]: any;
}

export interface Localidad { Id: number; Nombre: string; }

@Injectable({ providedIn: 'root' })
export class InmueblesService {
  private baseUrl      = `${environment.apiBase}/inmuebles`;
  private regionesUrl  = `${environment.apiBase}/regiones`;
  private comunasUrl   = `${environment.apiBase}/comunas`;

  constructor(private http: HttpClient) {}

  private authHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token') || '';
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
    return { headers };
  }

  /**
   * GET /api/v1/inmuebles (parámetros EXACTOS del Swagger)
   */
  listInmuebles(opts: {
    page?: number;
    pageSize?: number;       // → page_size
    active?: boolean | null;
    servicioId?: number | null;  // → servicio_id
    regionId?: number | null;    // → region_id
    comunaId?: number | null;    // → comuna_id
    tipoInmuebleId?: number | null; // → tipo_inmueble
    direccion?: string | null;   // → direccion
    search?: string | null;      // → search
    gev?: number | null;         // → gev
  } = {}): Observable<{ items: Inmueble[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      active = true,
      servicioId = null,
      regionId = null,
      comunaId = null,
      tipoInmuebleId = null,
      direccion = null,
      search = null,
      gev = null,
    } = opts;

    let params = new HttpParams()
      .set('page', String(page))
      .set('page_size', String(pageSize));

    if (active !== null && active !== undefined) params = params.set('active', String(active));
    if (servicioId != null)   params = params.set('servicio_id', String(servicioId));
    if (regionId != null)     params = params.set('region_id', String(regionId));
    if (comunaId != null)     params = params.set('comuna_id', String(comunaId));
    if (tipoInmuebleId != null) params = params.set('tipo_inmueble', String(tipoInmuebleId));

    // Texto: usa 'search' y/o 'direccion' según Swagger
    const dir = (direccion ?? '').toString().trim();
    const sch = (search ?? '').toString().trim();
    if (dir) params = params.set('direccion', dir);
    if (sch) params = params.set('search', sch);

    if (gev != null) params = params.set('gev', String(gev));

    return this.http.get<any>(this.baseUrl, { params, ...this.authHeaders() }).pipe(
      map(res => {
        const data: any[] = Array.isArray(res) ? res : (res?.items ?? res?.data ?? res?.results ?? []);
        const total = Array.isArray(res) ? data.length : (res?.total ?? res?.count ?? data.length);
        return { items: data.map(this.normalize), total };
      }),
      catchError(err => throwError(() => err))
    );
  }

  // ====== CATÁLOGOS ======
  getRegiones(): Observable<Localidad[]> {
    const params = new HttpParams().set('page', '1').set('page_size', '200');
    return this.http.get<any>(this.regionesUrl, { params, ...this.authHeaders() }).pipe(
      map(res => {
        const data = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
        return (data as any[]).map(r => ({
          Id: Number(r?.Id ?? r?.id),
          Nombre: r?.Nombre ?? r?.nombre ?? ''
        })).filter(x => Number.isFinite(x.Id) && x.Nombre);
      }),
      catchError(err => throwError(() => err))
    );
  }

  getComunasByRegionId(regionId: number): Observable<Localidad[]> {
    return this.http.get<any>(`${this.comunasUrl}/byRegionId/${regionId}`, this.authHeaders()).pipe(
      map(res => {
        const data = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
        return (data as any[]).map(c => ({
          Id: Number(c?.Id ?? c?.id),
          Nombre: c?.Nombre ?? c?.nombre ?? ''
        })).filter(x => Number.isFinite(x.Id) && x.Nombre);
      }),
      catchError(err => throwError(() => err))
    );
  }

  // ====== Normalizador ======
  private normalize = (x: any): Inmueble => ({
    Id:            x?.Id ?? x?.id ?? x?.ID,
    Nombre:        x?.Nombre ?? x?.nombre ?? x?.Name ?? '',
    TipoInmueble:  x?.TipoInmueble ?? x?.tipoInmueble ?? x?.tipo ?? '',
    ServicioId:    x?.ServicioId ?? x?.servicio_id ?? x?.servicioId,
    Active:        x?.Active ?? x?.Activo ?? x?.active,
    RegionId:      x?.RegionId ?? x?.region_id ?? x?.regionId ?? x?.Direccion?.RegionId,
    ComunaId:      x?.ComunaId ?? x?.comuna_id ?? x?.comunaId ?? x?.Direccion?.ComunaId,
    Direccion: {
      Id: x?.Direccion?.Id ?? x?.direccion?.Id,
      Calle: x?.Direccion?.Calle ?? x?.direccion?.Calle,
      Numero: x?.Direccion?.Numero ?? x?.direccion?.Numero,
      DireccionCompleta: x?.Direccion?.DireccionCompleta ?? x?.direccion?.DireccionCompleta ?? ''
    },
    ...x
  });
}
