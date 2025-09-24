// src/app/services/consumos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CompraDTO {
  Id: number | string;
  DivisionId?: number | null;
  EnergeticoId?: number | null;
  NumeroClienteId?: number | null;
  FechaCompra?: string | null;
  Consumo?: number | null;
  Costo?: number | null;
  InicioLectura?: string | null;
  FinLectura?: string | null;
  Active?: boolean | null;
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class ConsumosService {
  private baseUrl = `${environment.apiBase}/compras`;

  constructor(private http: HttpClient) {}

  /* ==== helpers ==== */
  private authHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token') || '';
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
    return { headers };
  }

  private toParamVal(v: any): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'boolean') return String(v);
    return String(v);
  }

  /* ==== LIST ==== */
  /**
   * GET /api/v1/compras
   * Parámetros EXACTOS del Swagger:
   * - q, page, page_size, DivisionId, EnergeticoId, NumeroClienteId,
   *   FechaDesde, FechaHasta, active
   *
   * Devuelve { items, total } homogéneo.
   */
  list(opts: {
    q?: string | null;
    page?: number;
    pageSize?: number;              // → page_size
    DivisionId?: number | null;
    EnergeticoId?: number | null;
    NumeroClienteId?: number | null;
    FechaDesde?: string | null;     // YYYY-MM-DD
    FechaHasta?: string | null;     // YYYY-MM-DD
    active?: boolean | null;
  } = {}): Observable<{ items: CompraDTO[]; total: number }> {
    const {
      q = null,
      page = 1,
      pageSize = 50,
      DivisionId = null,
      EnergeticoId = null,
      NumeroClienteId = null,
      FechaDesde = null,
      FechaHasta = null,
      active = true
    } = opts;

    let params = new HttpParams()
      .set('page', String(page))
      .set('page_size', String(pageSize));

    if (q && q.trim()) params = params.set('q', q.trim());
    if (DivisionId != null)     params = params.set('DivisionId', this.toParamVal(DivisionId));
    if (EnergeticoId != null)   params = params.set('EnergeticoId', this.toParamVal(EnergeticoId));
    if (NumeroClienteId != null) params = params.set('NumeroClienteId', this.toParamVal(NumeroClienteId));
    if (FechaDesde)             params = params.set('FechaDesde', FechaDesde);
    if (FechaHasta)             params = params.set('FechaHasta', FechaHasta);
    if (active !== null && active !== undefined) params = params.set('active', this.toParamVal(active));

    return this.http.get<any>(this.baseUrl, { params, ...this.authHeaders() }).pipe(
      map(res => {
        // El swagger devuelve { total, page, page_size, items }
        const data: any[] = Array.isArray(res) ? res : (res?.items ?? res?.data ?? res?.results ?? []);
        const total = Array.isArray(res) ? data.length : (res?.total ?? res?.count ?? data.length);
        return { items: data.map(this.normalize), total };
      }),
      catchError(err => throwError(() => err))
    );
  }

  /* ==== Normalizador defensivo ==== */
  private normalize = (x: any): CompraDTO => ({
    Id: x?.Id ?? x?.id ?? x?.ID,
    DivisionId: x?.DivisionId ?? x?.division_id ?? null,
    EnergeticoId: x?.EnergeticoId ?? x?.energetico_id ?? null,
    NumeroClienteId: x?.NumeroClienteId ?? x?.numero_cliente_id ?? null,
    FechaCompra: x?.FechaCompra ?? x?.fecha_compra ?? null,
    Consumo: x?.Consumo ?? x?.consumo ?? null,
    Costo: x?.Costo ?? x?.costo ?? null,
    InicioLectura: x?.InicioLectura ?? x?.inicio_lectura ?? null,
    FinLectura: x?.FinLectura ?? x?.fin_lectura ?? null,
    Active: x?.Active ?? x?.Activo ?? x?.active ?? true,
    ...x
  });
}
