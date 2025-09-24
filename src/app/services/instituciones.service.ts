// src/app/services/instituciones.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Institucion {
  Id: number;
  Nombre: string;
  Active?: boolean;
}

export interface CreateInstitucionDto {
  Nombre: string;
}

@Injectable({ providedIn: 'root' })
export class InstitucionesService {
  private apiUrl = `${environment.apiBase}/instituciones`;

  constructor(private http: HttpClient) {}

  private authHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token');
    return {
      headers: new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : ''
      })
    };
  }

  getInstituciones(): Observable<Institucion[]> {
    return this.http.get<Institucion[]>(this.apiUrl, this.authHeaders());
  }

  getInstitucionById(id: number): Observable<Institucion> {
    return this.http.get<Institucion>(`${this.apiUrl}/${id}`, this.authHeaders());
  }

  createInstitucion(inst: CreateInstitucionDto): Observable<Institucion> {
    return this.http.post<Institucion>(this.apiUrl, inst, this.authHeaders());
  }

  updateInstitucion(id: number, cambios: { Nombre: string }): Observable<Institucion> {
    return this.http.put<Institucion>(`${this.apiUrl}/${id}`, cambios, this.authHeaders());
  }

  /** ✅ Soft delete (desactivar) */
  deleteInstitucion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.authHeaders());
  }

  /** ✅ Reactivar */
  reactivarInstitucion(id: number): Observable<Institucion> {
    return this.http.patch<Institucion>(`${this.apiUrl}/${id}/reactivar`, {}, this.authHeaders());
  }
}
