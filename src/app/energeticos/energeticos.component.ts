import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Layout
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

// Service
import { EnergeticosService, Energetico } from '../services/energeticos.service';

@Component({
  selector: 'app-energeticos',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './energeticos.component.html',
  styleUrls: ['./energeticos.component.scss']
})
export class EnergeticosComponent implements OnInit {
  energeticos: Energetico[] = [];

  loading = true;
  error = '';

  filtroNombre = '';
  pagina = 1;
  pageSize = 10;
  total = 0;
  totalPaginas = 1;

  constructor(
    private energeticosService: EnergeticosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ⚡ Carga inicial con Fallback:
    // 1) sin 'q'  → si viene vacío → 2) con q:'1'
    this.cargarConFallback(1);
  }

  /** Intenta sin q; si viene vacío, reintenta con q:'1' */
  private cargarConFallback(page: number): void {
    this.loading = true;
    this.error = '';

    // 1) SIN q (no se envía el parámetro)
    this.energeticosService.listEnergeticos({ page, pageSize: this.pageSize, q: '' }).subscribe({
      next: ({ items, total }) => {
        if (items.length > 0) {
          this.setDatos(items, total, page);
          return;
        }
        // 2) Fallback con q:'1'
        this.energeticosService.listEnergeticos({ page, pageSize: this.pageSize, q: '1' }).subscribe({
          next: ({ items: items2, total: total2 }) => this.setDatos(items2, total2, page),
          error: (err) => this.handleError(err)
        });
      },
      error: (err) => this.handleError(err)
    });
  }

  /** Carga normal (para filtrar/paginar cuando hay filtro) */
  private cargar(opts: { page?: number; q?: string | null } = {}): void {
    this.loading = true;
    this.error = '';

    const page = opts.page ?? 1;
    const q = (opts.q ?? this.filtroNombre).trim(); // si vacío, el service NO lo envía

    this.energeticosService.listEnergeticos({ page, pageSize: this.pageSize, q }).subscribe({
      next: ({ items, total }) => this.setDatos(items, total, page),
      error: (err) => this.handleError(err)
    });
  }

  private setDatos(items: Energetico[], total: number, page: number): void {
    this.energeticos = items;
    this.total = total;
    this.pagina = page;
    this.totalPaginas = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.loading = false;
  }

  private handleError(err: any): void {
    console.error('[Energeticos] error:', err);
    this.error = 'No se pudieron cargar los energéticos.';
    this.loading = false;
  }

  /* ===== Filtros ===== */
  aplicarFiltro(): void {
    this.pagina = 1;
    const q = this.filtroNombre.trim();
    if (q) {
      // hay filtro → carga normal con q
      this.cargar({ page: 1, q });
    } else {
      // sin filtro → vuelve al fallback para mostrar “todo”
      this.cargarConFallback(1);
    }
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.pagina = 1;
    this.cargarConFallback(1);
  }

  /* ===== Paginación ===== */
  irA(p: number): void {
    if (p < 1 || p > this.totalPaginas || p === this.pagina) return;

    const q = this.filtroNombre.trim();
    if (q) {
      this.cargar({ page: p, q });
    } else {
      this.cargarConFallback(p);
    }
  }

  /* ===== Helpers UI ===== */
  isActivo(e: Energetico): boolean {
    return !!(e.Active ?? e['Activo'] ?? e['Habilitado']);
  }

  /* ===== Acciones ===== */
  crearNuevo(): void {
    this.router.navigate(['/energeticos/crear']);
  }

  editar(e: Energetico): void {
    this.router.navigate(['/energeticos/editar', e.Id]);
  }

  eliminar(e: Energetico): void {
    console.log('Eliminar energético', e);
    // this.energeticosService.deleteEnergetico(e.Id).subscribe(() => this.cargarConFallback(this.pagina));
  }

  volver(): void {
    history.back();
  }
}
