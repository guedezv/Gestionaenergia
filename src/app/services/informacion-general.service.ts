// src/app/services/informacion-general.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DireccionDetalle {
  Id: number;
  Calle: string;
  Numero: string;
  DireccionCompleta: string;
  RegionId: number;
  ProvinciaId: number;
  ComunaId: number;
}

@Injectable({ providedIn: 'root' })
export class InformacionGeneralService {
  private baseUrl = `${environment.apiBase}/direcciones`;

  constructor(private http: HttpClient) {}

  private authHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      headers: new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : ''
      })
    };
  }

  /** GET /api/v1/direcciones/{id} */
  getDireccionById(id: number): Observable<DireccionDetalle> {
    return this.http.get<DireccionDetalle>(`${this.baseUrl}/${id}`, this.authHeaders());
    // Respuesta esperada según swagger:
    // { Id, Calle, Numero, DireccionCompleta, RegionId, ProvinciaId, ComunaId }
  }
}
