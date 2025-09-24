// src/app/services/unidades.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
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

  // Campos opcionales que algunas APIs traen en el listing de “unidades”
  NombreUnidad?: string;
  Ubicacion?: string;
  Active?: boolean;
}

export interface DireccionQuery {
  page?: number;       // 1..N
  page_size?: number;  // 1..200
  search?: string | null; // backend acepta un único "search"
}

export interface DireccionListResp {
  items: Direccion[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class UnidadesService {
  private apiUrl = `${environment.apiBase}/direcciones`;

  constructor(private http: HttpClient) {}

  private authHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token');
    return {
      headers: new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : ''
      })
    };
  }

  listar(params: DireccionQuery): Observable<DireccionListResp> {
    let httpParams = new HttpParams();
    if (params.page)      httpParams = httpParams.set('page', String(params.page));
    if (params.page_size) httpParams = httpParams.set('page_size', String(params.page_size));
    if (params.search)    httpParams = httpParams.set('search', params.search);

    const reqPage = params.page ?? 1;
    const reqSize = params.page_size ?? 10;

    return this.http.get<Direccion[] | any>(this.apiUrl, {
      ...this.authHeaders(),
      params: httpParams,
      observe: 'response'
    }).pipe(
      map((resp: HttpResponse<Direccion[] | any>) => {
        let items: Direccion[] =
          Array.isArray(resp.body) ? resp.body as Direccion[] : (resp.body?.items ?? []);
        if (!Array.isArray(items)) items = [];

        const h = resp.headers;
        const xTotalCount = h.get('x-total-count') || h.get('X-Total-Count');
        const xTotalPages = h.get('x-total-pages') || h.get('X-Total-Pages');
        const xPage       = h.get('x-page') || h.get('X-Page');
        const xPageSize   = h.get('x-page-size') || h.get('X-Page-Size');

        const page = Number(xPage ?? reqPage) || reqPage;
        const pageSize = Number(xPageSize ?? reqSize) || reqSize;

        let total = 0;
        if (xTotalCount) {
          total = Number(xTotalCount) || 0;
        } else if (!Array.isArray(resp.body) && typeof resp.body?.total === 'number') {
          total = resp.body.total;
        } else {
          total = items.length === pageSize ? page * pageSize + 1 : (page - 1) * pageSize + items.length;
        }

        const totalPages = xTotalPages ? (Number(xTotalPages) || 1) : Math.max(1, Math.ceil((total || 0) / pageSize));

        return { items, total, page, pageSize, totalPages };
      })
    );
  }

  // Si tu backend permite borrar la unidad/dirección:
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.authHeaders());
  }
}
