// src/app/services/usuarios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 

// 🔹 Interface ajustada al backend
export interface Usuario {
  id: number;
  email: string;
  full_name: string; // 👈 usa full_name porque así viene en la API
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = `${environment.apiBase}/users`; 

  constructor(private http: HttpClient) {}

  // 🔹 GET lista de usuarios
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }
}
