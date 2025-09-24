// src/app/services/mi-unidad-energeticos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Energetico {
  Id: number;
  Nombre: string;
  Icono?: string | null;
  Multiple?: boolean | null;
  PermiteMedidor?: boolean | null;
  Posicion?: number | null;
  PermitePotenciaSuministrada?: boolean | null;
  PermiteTipoTarifa?: boolean | null;
  Active?: boolean | null;
}

@Injectable({ providedIn: 'root' })
export class MiUnidadEnergeticosService {
  private baseUrl = `${environment.apiBase}/energeticos`;

  constructor(private http: HttpClient) {}

  private auth() {
    const token = localStorage.getItem('access_token') || '';
    return {
      headers: new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : ''
      })
    };
  }

  /**
   * ✅ Energeticos activos por división (nuevo endpoint solicitado)
   * GET /api/v1/energeticos/activos/division/{division_id}
   * Devuelve un array simple (sin paginación).
   */
  getEnergeticosActivosByDivision(divisionId: number): Observable<Energetico[]> {
    const url = `${this.baseUrl}/activos/division/${divisionId}`;
    return this.http.get<Energetico[]>(url, this.auth());
  }
}
