// src/app/unidades-energeticos/unidades-energeticos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

// Layout
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

type UnidadMedida = {
  Id: number | string;
  Nombre: string;
  Abreviatura?: string;
  [k: string]: any;
};

@Component({
  selector: 'app-unidades-energeticos',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './unidades-energeticos.component.html',
  styleUrls: ['./unidades-energeticos.component.scss'],
})
export class UnidadesEnergeticosComponent implements OnInit {
  unidades: UnidadMedida[] = [];
  loading = true;
  error = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUnidades();
  }

  private cargarUnidades(): void {
    this.loading = true;
    this.error = '';

    // 1) Intento con los parámetros que muestra el swagger
    const params = new HttpParams()
      .set('page', '1')
      .set('page_size', '50');

    this.http.get<any>('/api/v1/unidades-medida', { params }).subscribe({
      next: (res: any) => {
        this.unidades = this.mapList(res);
        this.loading = false;
      },
      error: (err: any) => {
        // 2) Si el backend rechaza con 422/500, probamos SIN parámetros
        if (err?.status === 422 || err?.status === 500) {
          this.http.get<any>('/api/v1/unidades-medida').subscribe({
            next: (res2: any) => {
              this.unidades = this.mapList(res2);
              this.loading = false;
            },
            error: (err2: any) => this.handleError(err2),
          });
        } else {
          this.handleError(err);
        }
      },
    });
  }

  /** Normaliza arreglo desde distintas formas de respuesta */
  private mapList(res: any): UnidadMedida[] {
    const list = Array.isArray(res)
      ? res
      : (res?.data ?? res?.Unidades ?? res?.items ?? res?.results ?? []);
    return (list as any[]).map(this.normalizeUnidad);
  }

  /** Normaliza claves posibles del backend */
  private normalizeUnidad = (u: any): UnidadMedida => ({
    Id: u?.Id ?? u?.id ?? u?.ID ?? '',
    Nombre: u?.Nombre ?? u?.nombre ?? u?.Name ?? u?.Descripcion ?? '',
    Abreviatura: u?.Abreviatura ?? u?.Abrev ?? u?.Sigla ?? u?.Abrv ?? u?.Simbolo ?? '',
    ...u,
  });

  private handleError(_err: any): void {
    this.loading = false;
    this.error = 'No se pudieron cargar las unidades de medida.';
  }

  // ===== Acciones =====
  editarUnidad(u: UnidadMedida): void {
    if (!u?.Id) return;
    this.router.navigate(['/unidades-energeticos/editar', u.Id]);
  }

  eliminarUnidad(u: UnidadMedida): void {
    console.log('Eliminar unidad (pendiente de implementar)', u);
    // Ejemplo si más adelante habilitas DELETE:
    // this.http.delete(`/api/v1/unidades-medida/${u.Id}`).subscribe(() => this.cargarUnidades());
  }
  crearNuevaUnidad(): void {
  // Ajusta la ruta si tu componente de creación usa otro path
  this.router.navigate(['/unidades-energeticos/crear']);
}

volver(): void {
  history.back();
}
}
