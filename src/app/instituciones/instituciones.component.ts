import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';

import { InstitucionesService, Institucion } from '../services/instituciones.service';

// layout
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

// Angular Material
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-instituciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    MatIconModule,  
    MatSlideToggleModule
  ],
  templateUrl: './instituciones.component.html',
  styleUrls: ['./instituciones.component.scss']
})
export class InstitucionesComponent implements OnInit {

  instituciones: Institucion[] = [];
  institucionesFiltradas: Institucion[] = [];
  institucionesPaginadas: Institucion[] = [];

  filtro = '';
  paginaActual = 1;
  tamanoPagina = 10;
  totalPaginas = 0;

  /** id bloqueado mientras se hace toggle para evitar clicks repetidos */
  togglingId: number | null = null;

  constructor(
    private institucionesService: InstitucionesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarInstituciones();
  }

  private cargarInstituciones(): void {
    this.institucionesService.getInstituciones().subscribe({
      next: (data) => {
        const list = (data ?? []).map(i => ({
          ...i,
          Active: i?.Active ?? (i as any)?.active ?? true
        }));
        this.instituciones = list;
        this.aplicarFiltro();
      },
      error: (err: any) => {
        console.error('[Instituciones] error al cargar:', err);
        this.instituciones = [];
        this.aplicarFiltro();
      }
    });
  }

  aplicarFiltro(): void {
    const f = this.filtro.trim().toLowerCase();
    this.institucionesFiltradas = !f
      ? this.instituciones.slice()
      : this.instituciones.filter(inst => (inst.Nombre || '').toLowerCase().includes(f));
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    const total = this.institucionesFiltradas.length;
    this.totalPaginas = Math.max(1, Math.ceil(total / this.tamanoPagina));
    const start = (this.paginaActual - 1) * this.tamanoPagina;
    const end = start + this.tamanoPagina;
    this.institucionesPaginadas = this.institucionesFiltradas.slice(start, end);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginacion();
    }
  }

  // Acciones
  editarInstitucion(inst: Institucion): void {
    this.router.navigate(['/instituciones/editar', inst.Id]);
  }

  /** Si todavía tienes el botón "eliminar", lo redirigimos al toggle OFF */
  eliminarInstitucion(inst: Institucion): void {
    this.onToggleActivo(inst, false);
  }

  /**
   * Toggle Activo/Inactivo:
   *  - checked = true  → PATCH /{id}/reactivar
   *  - checked = false → DELETE /{id}
   * Unificamos a Observable<boolean> para evitar problemas de tipos en subscribe.
   */
  onToggleActivo(inst: Institucion, checked: boolean): void {
    if (this.togglingId) return;            // evita doble click
    const previous = !!inst.Active;
    inst.Active = checked;                   // UI optimista
    this.togglingId = inst.Id;

    const obs$ = checked
      ? this.institucionesService
          .reactivarInstitucion(inst.Id)     // Observable<Institucion>
          .pipe(map(() => true))             // → Observable<boolean>
      : this.institucionesService
          .deleteInstitucion(inst.Id)        // Observable<void>
          .pipe(map(() => true));            // → Observable<boolean>

    obs$.subscribe({
      next: () => {
        inst.Active = checked;               // confirmar estado
        this.togglingId = null;
      },
      error: (err: any) => {
        console.error('[Instituciones] toggle activo error:', err);
        inst.Active = previous;              // revertir UI
        this.togglingId = null;
      }
    });
  }

  crearNuevaInstitucion(): void {
    this.router.navigate(['/instituciones/crear']);
  }

  volver(): void {
    this.router.navigate(['/home-unidades']);
  }
}
