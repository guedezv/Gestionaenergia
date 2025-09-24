// src/app/unidades/unidades.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// layout
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

import { UnidadesService, Direccion } from '../services/unidades.service';

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './unidades.component.html',
  styleUrls: ['./unidades.component.scss']
})
export class UnidadesComponent implements OnInit {

  // filtros
  filtroNombre = '';
  filtroDireccion = '';

  // tabla + server pagination
  direcciones: Direccion[] = [];
  paginaActual = 1;
  tamanoPagina = 10;
  totalPaginas = 1;
  totalRegistros = 0;

  cargando = false;
  error = '';
  eliminandoId: number | null = null;

  constructor(
    private unidadesSrv: UnidadesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  private buildSearch(): string | null {
    // el backend solo tiene "search": concatenamos los 2 filtros
    const n = this.filtroNombre.trim();
    const d = this.filtroDireccion.trim();
    const s = [n, d].filter(Boolean).join(' ');
    return s || null;
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';

    this.unidadesSrv.listar({
      page: this.paginaActual,
      page_size: this.tamanoPagina,
      search: this.buildSearch()
    }).subscribe({
      next: (resp) => {
        this.direcciones = (resp.items ?? []).map(it => ({
          ...it,
          // normalizamos por si tu API no manda estos campos
          NombreUnidad: it.NombreUnidad ?? it.DireccionCompleta ?? `${it.Calle ?? ''} ${it.Numero ?? ''}`.trim(),
          Ubicacion: it.Ubicacion ?? it.DireccionCompleta ?? '',
          Active: typeof it.Active === 'boolean' ? it.Active : false
        }));
        this.totalRegistros = resp.total ?? 0;
        this.totalPaginas = resp.totalPages ?? 1;
        this.paginaActual = resp.page ?? this.paginaActual;
        this.tamanoPagina = resp.pageSize ?? this.tamanoPagina;
        this.cargando = false;
      },
      error: (err) => {
        console.error('[Unidades] error:', err);
        this.direcciones = [];
        this.totalRegistros = 0;
        this.totalPaginas = 1;
        this.cargando = false;
        this.error =
          err?.status === 401 ? 'No autorizado. Inicia sesión nuevamente.' :
          err?.status === 403 ? 'No tienes permisos para ver estas unidades.' :
          err?.status === 500 ? 'El servidor tuvo un error (500).' :
          'No se pudieron cargar las unidades.';
      }
    });
  }

  aplicarFiltro(): void {
    this.paginaActual = 1;
    this.cargar();
  }

  cambiarPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.cargar();
  }

  editar(d: Direccion): void {
    // ajusta a tu ruta real
    this.router.navigate(['/unidades/editar', d.Id]);
  }

  eliminar(d: Direccion): void {
    if (this.eliminandoId) return;
    if (!confirm('¿Eliminar esta unidad/dirección?')) return;

    this.eliminandoId = d.Id;
    this.unidadesSrv.eliminar(d.Id).subscribe({
      next: () => {
        this.eliminandoId = null;
        // si borra la última de la página, retrocede una página cuando corresponda
        if (this.direcciones.length === 1 && this.paginaActual > 1) {
          this.paginaActual -= 1;
        }
        this.cargar();
      },
      error: (err) => {
        console.error('[Unidades] eliminar error:', err);
        this.eliminandoId = null;
        alert('No se pudo eliminar. Inténtalo nuevamente.');
      }
    });
  }

  crearNueva(): void {
    this.router.navigate(['/unidades/crear']);
  }

  volver(): void {
    this.router.navigate(['/home-unidades']);
  }
}
