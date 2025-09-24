import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Direccion } from './home-unidades.service';

@Injectable({ providedIn: 'root' })
export class MiUnidadInformacionGeneralService {
  private base = environment.apiBase;
  constructor(private http: HttpClient) {}

  private auth() {
    const token = localStorage.getItem('access_token');
    return { headers: new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' }) };
  }

  getDireccionById(id: number): Observable<Direccion> {
    return this.http.get<Direccion>(`${this.base}/direcciones/${id}`, this.auth());
    // Swagger: GET /api/v1/direcciones/{direccion_id}
  }
}
