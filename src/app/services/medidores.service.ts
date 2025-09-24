import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Medidor {
  Id: number | string;
  Numero?: string | number;
  UnidadId?: number | string;
  UnidadPropietaria?: string;
  NumeroCliente?: string | number;
  EsCompartido?: boolean;
  EsInteligente?: boolean;
  Active?: boolean;

  DivisionId?: number | string | null;
  InstitucionId?: number | string | null;
  [k: string]: any;
}

export interface DivisionMedidor {
  Id: number | string;
  DivisionId: number | string;
  MedidorId: number | string;
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class MedidoresService {
  private baseUrl = `${environment.apiBase}/medidores`;
  private medidorDivisionesUrl = `${environment.apiBase}/medidor-divisiones`;

  constructor(private http: HttpClient) {}

  private authHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token') || '';
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })
      : new HttpHeaders({ 'Content-Type': 'application/json' });
    return { headers };
  }

  list(opts: {
    q?: string | null;
    page?: number;
    pageSize?: number;
    DivisionId?: number | string | null;
    NumeroClienteId?: number | string | null;
  } = {}): Observable<{ items: Medidor[]; total: number }> {

    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 10;
    const qEff = (opts.q ?? '').toString().trim() || '1';

    let params = new HttpParams()
      .set('page', String(page))
      .set('page_size', String(pageSize))
      .set('q', qEff);

    if (opts.DivisionId != null && opts.DivisionId !== '')
      params = params.set('DivisionId', String(opts.DivisionId));

    if (opts.NumeroClienteId != null && opts.NumeroClienteId !== '')
      params = params.set('NumeroClienteId', String(opts.NumeroClienteId));

    return this.http.get<any>(this.baseUrl, { params, ...this.authHeaders() }).pipe(
      map(res => {
        const data = Array.isArray(res) ? res : (res?.['data'] ?? res?.['items'] ?? res?.['results'] ?? []);
        const total = Array.isArray(res) ? data.length : (res?.['total'] ?? res?.['count'] ?? data.length);
        const items = (data as any[]).map(this.normalize);
        return { items, total };
      }),
      catchError(err => throwError(() => err))
    );
  }

  getById(id: number | string): Observable<Medidor> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, this.authHeaders()).pipe(
      map(res => this.normalize(res)),
      catchError(err => throwError(() => err))
    );
  }

  getDivisionSet(divisionId: number | string): Observable<DivisionMedidor[]> {
    return this.http.get<any>(`${this.medidorDivisionesUrl}/division/${divisionId}`, this.authHeaders()).pipe(
      map(res => {
        const data = Array.isArray(res) ? res : (res?.['data'] ?? res ?? []);
        return (data as any[]).map(r => ({
          Id: r?.['Id'] ?? r?.['id'] ?? '',
          DivisionId: r?.['DivisionId'] ?? r?.['divisionId'] ?? divisionId,
          MedidorId: r?.['MedidorId'] ?? r?.['medidorId'] ?? r?.['Medidor']?.['Id'] ?? r?.['Medidor']?.['ID'] ?? ''
        }));
      }),
      catchError(err => throwError(() => err))
    );
  }

  replaceDivisionSet(divisionId: number | string, medidorIds: (number | string)[]): Observable<any> {
    const body = { Ids: medidorIds };
    return this.http.put<any>(`${this.medidorDivisionesUrl}/division/${divisionId}`, body, this.authHeaders()).pipe(
      catchError(err => throwError(() => err))
    );
  }

  private normalize = (m: any): Medidor => ({
    Id: m?.['Id'] ?? m?.['id'] ?? m?.['ID'] ?? '',
    Numero: m?.['Numero'] ?? m?.['numero'] ?? m?.['Serial'] ?? '',
    UnidadId: m?.['UnidadId'] ?? m?.['unidadId'] ?? m?.['Unidad']?.['Id'] ?? m?.['Unidad']?.['ID'],
    UnidadPropietaria:
      m?.['UnidadPropietaria'] ??
      m?.['Unidad']?.['Nombre'] ??
      m?.['Unidad']?.['Direccion'] ??
      m?.['Direccion'] ??
      '',
    NumeroCliente: m?.['NumeroCliente'] ?? m?.['NumeroClienteId'] ?? m?.['ClienteNumero'] ?? '',
    EsCompartido: m?.['EsCompartido'] ?? m?.['Compartido'] ?? m?.['Shared'] ?? false,
    EsInteligente: m?.['EsInteligente'] ?? m?.['Inteligente'] ?? m?.['Smart'] ?? false,
    Active: m?.['Active'] ?? m?.['Activo'] ?? m?.['active'] ?? false,

    DivisionId: m?.['DivisionId'] ?? m?.['ServicioId'] ?? m?.['Servicio']?.['Id'] ?? null,
    InstitucionId:
      m?.['InstitucionId'] ??
      m?.['Servicio']?.['InstitucionId'] ??
      m?.['Unidad']?.['InstitucionId'] ??
      null,

    ...m
  });
}
