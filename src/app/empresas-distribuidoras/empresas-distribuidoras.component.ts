import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

// Layout
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

// Service
import {
  EmpresasDistribuidorasService,
  EmpresaDistribuidora,
  Energetico,
  Localidad
} from '../services/empresas-distribuidoras.service';

@Component({
  selector: 'app-empresas-distribuidoras',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './empresas-distribuidoras.component.html',
  styleUrls: ['./empresas-distribuidoras.component.scss']
})
export class EmpresasDistribuidorasComponent implements OnInit {
  // data
  empresas: EmpresaDistribuidora[] = [];

  // catálogos para filtros
  energeticos: Energetico[] = [];
  regiones: Localidad[] = [];
  comunas: Localidad[] = [];

  // mapa id->nombre para mostrar energético aunque el backend solo entregue EnergeticoId
  private energeticosMap: Record<number, string> = {};

  // filtros
  filtroNombre = '';
  energeticoId: number | null = null;
  regionId: number | null = null;
  provinciaId: number | null = null; // (por si se incorpora luego; hoy no lo usamos)
  comunaId: number | null = null;

  // paginación
  pagina = 1;
  pageSize = 10;
  total = 0;
  totalPaginas = 1;

  // UI
  loading = true;
  error = '';

  constructor(
    private service: EmpresasDistribuidorasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = '';

    (async () => {
      try {
        const [energeticos, regiones] = await Promise.all([
          firstValueFrom(this.service.getEnergeticos()),
          firstValueFrom(this.service.getRegiones())
        ]);

        this.energeticos = energeticos ?? [];
        this.regiones = regiones ?? [];
        this.energeticosMap = Object.fromEntries(
          (this.energeticos || []).map(e => [e.Id, e.Nombre])
        );

        // Carga inicial sin filtro por nombre
        this.cargarEmpresas({ page: 1, q: null });
      } catch (e) {
        console.error('[EmpresasDistribuidoras] error catálogos:', e);
        this.error = 'No se pudieron cargar los catálogos.';
        this.loading = false;
      }
    })();
  }

  // -------- carga principal --------
  private cargarEmpresas(opts: { page?: number; q?: string | null } = {}): void {
    this.loading = true;
    this.error = '';

    const page = opts.page ?? this.pagina;
    const trimmed = (opts.q ?? this.filtroNombre)?.trim();
    const q = trimmed ? trimmed : null;

    this.service.listEmpresas({
      q,
      page,
      pageSize: this.pageSize,
      energeticoId: this.energeticoId,
      comunaId: this.comunaId,
      active: true
    }).subscribe({
      next: ({ items, total }) => {
        this.empresas = (items || []).map(e =>
          e.Energetico
            ? e
            : ({ ...e, Energetico: this.energeticosMap[Number(e.EnergeticoId || 0)] || '' })
        );

        this.total = total ?? this.empresas.length;
        this.pagina = page;
        this.totalPaginas = Math.max(1, Math.ceil(this.total / this.pageSize));
        this.loading = false;
      },
      error: (err) => this.handleError(err)
    });
  }

  // Devuelve el nombre del energético mostrado en la tabla
  energeticoLabel(e: EmpresaDistribuidora): string {
    const byField = (e as any).Energetico as string | undefined;
    const byMap = this.energeticosMap[Number((e as any).EnergeticoId)] || '';
    return (byField && byField.trim()) ? byField : (byMap || '—');
  }

  private handleError(err: any): void {
    console.error('[EmpresasDistribuidoras] error:', err);
    this.loading = false;
    this.error = 'No se pudieron cargar las empresas distribuidoras.';
  }

  // -------- filtros --------
  aplicarFiltro(): void {
    this.pagina = 1;
    this.cargarEmpresas({ page: 1 });
  }

  onRegionChange(): void {
    this.comunaId = null;
    this.comunas = [];
    if (!this.regionId) return;

    this.service.getComunasByRegionId(this.regionId).subscribe({
      next: (comunas) => (this.comunas = comunas ?? []),
      error: () => (this.error = 'No se pudieron cargar las comunas.')
    });
  }

  // -------- paginación --------
  irA(p: number): void {
    if (p < 1 || p > this.totalPaginas || p === this.pagina) return;
    this.cargarEmpresas({ page: p });
  }

  getPaginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // -------- helpers UI --------
  isActivo(e: EmpresaDistribuidora): boolean {
    return !!(e.Active ?? (e as any).Activo ?? (e as any).active);
  }

  // -------- acciones --------
  crearNuevo(): void {
    this.router.navigate(['/empresas-distribuidoras/crear']);
  }

  editar(e: EmpresaDistribuidora): void {
    this.router.navigate(['/empresas-distribuidoras/editar', e.Id]);
  }

  eliminar(e: EmpresaDistribuidora): void {
    console.log('Eliminar (pendiente API DELETE):', e);
  }

  volver(): void {
    history.back();
  }
}
