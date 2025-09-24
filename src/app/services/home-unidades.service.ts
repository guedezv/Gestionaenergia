// src/app/services/home-unidades.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Direccion {
  Id: number;
  Calle: string;
  Numero: string;
  DireccionCompleta: string;
  RegionId: number;
  ProvinciaId: number;
  ComunaId: number;
}

export interface DireccionListResp {
  items: Direccion[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class HomeUnidadesService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  private auth() {
    const token = localStorage.getItem('access_token');
    return { headers: new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' }) };
  }

  /** Listado con meta desde headers */
  getDirecciones(params: { page: number; page_size: number; search?: string }): Observable<DireccionListResp> {
    const q = new URLSearchParams();
    q.set('page', String(params.page));
    q.set('page_size', String(params.page_size));
    if (params.search) q.set('search', params.search);

    return this.http.get<Direccion[]>(
      `${this.base}/direcciones?${q.toString()}`,
      { ...this.auth(), observe: 'response' as const }
    ).pipe(
      map(resp => {
        const items = resp.body ?? [];
        const page = Number(resp.headers.get('x-page') ?? params.page);
        const pageSize = Number(resp.headers.get('x-page-size') ?? params.page_size);
        const total = Number(resp.headers.get('x-total-count') ?? items.length);
        const totalPages = Number(resp.headers.get('x-total-pages') ?? Math.max(1, Math.ceil(total / pageSize)));
        return { items, page, pageSize, total, totalPages };
      })
    );
  }

  /** Detalle por id (usado por Mi Unidad > Info General) */
  getDireccionById(id: number): Observable<Direccion> {
    return this.http.get<Direccion>(`${this.base}/direcciones/${id}`, this.auth());
  }
}
