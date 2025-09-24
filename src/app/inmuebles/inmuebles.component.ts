// src/app/inmuebles/inmuebles.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// layout
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

// service
import { InmueblesService, Inmueble } from '../services/inmuebles.service';

type Localidad = { Id: number; Nombre: string };

@Component({
  selector: 'app-inmuebles',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './inmuebles.component.html',
  styleUrls: ['./inmuebles.component.scss']
})
export class InmueblesComponent implements OnInit {
  // data
  inmuebles: Inmueble[] = [];

  // ui state
  loading = true;
  error = '';

  // filtros
  filtroDireccion = '';
  regionId: number | null = null;
  comunaId: number | null = null;

  // paginación
  pagina = 1;
  pageSize = 10;
  total = 0;
  totalPaginas = 1;

  // combos
  regiones: Localidad[] = [];
  comunas:  Localidad[] = [];

  constructor(private inmueblesService: InmueblesService) {}

  ngOnInit(): void {
    // 1) Cargar regiones para el combo
    this.inmueblesService.getRegiones().subscribe({
      next: (regs) => { this.regiones = regs ?? []; },
      error: () => { this.regiones = []; }
    });

    // 2) Carga inicial de la tabla
    this.cargar({ page: 1 });
  }

  private cargar(opts: { page?: number } = {}): void {
    this.loading = true;
    this.error = '';

    const page = opts.page ?? 1;

    this.inmueblesService.listInmuebles({
      page,
      pageSize: this.pageSize,
      active: true,
      // Texto → usa parámetros del Swagger: 'search' y/o 'direccion'
      search: this.filtroDireccion.trim() || null,
      direccion: this.filtroDireccion.trim() || null,
      // Filtros exactos del Swagger:
      regionId: this.regionId,
      comunaId: this.comunaId
    }).subscribe({
      next: ({ items, total }) => {
        // Fallback por si el backend no aplicara el filtro (mientras tanto)
        let data = items ?? [];
        if (this.regionId != null || this.comunaId != null) {
          data = data.filter(it => {
            const reg =
              (it as any)?.RegionId ??
              (it as any)?.Direccion?.RegionId ?? null;
            const com =
              (it as any)?.ComunaId ??
              (it as any)?.Direccion?.ComunaId ?? null;

            const okRegion = (this.regionId == null) || Number(reg) === Number(this.regionId);
            const okComuna = (this.comunaId == null) || Number(com) === Number(this.comunaId);
            return okRegion && okComuna;
          });
        }

        this.inmuebles = data;
        this.total = (this.regionId != null || this.comunaId != null) ? data.length : (total ?? data.length);
        this.pagina = page;
        this.totalPaginas = Math.max(1, Math.ceil(this.total / this.pageSize));
        this.loading = false;
      },
      error: (err) => {
        console.error('[Inmuebles] error:', err);
        this.error = 'No se pudieron cargar los inmuebles.';
        this.loading = false;
      }
    });
  }

  aplicarFiltro(): void {
    this.pagina = 1;
    this.cargar({ page: 1 });
  }

  onRegionChange(): void {
    this.comunaId = null;
    this.comunas = [];
    if (this.regionId == null) return;

    this.inmueblesService.getComunasByRegionId(this.regionId).subscribe({
      next: (coms) => { this.comunas = coms ?? []; },
      error: () => { this.comunas = []; }
    });
  }

  irA(p: number): void {
    if (p < 1 || p > this.totalPaginas || p === this.pagina) return;
    this.cargar({ page: p });
  }

  editar(inm: Inmueble): void {
    console.log('Editar inmueble', inm);
    // this.router.navigate(['/inmuebles/editar', inm.Id]);
  }

  eliminar(inm: Inmueble): void {
    console.log('Eliminar inmueble', inm);
    // this.http.delete(`/api/v1/inmuebles/${inm.Id}`).subscribe(() => this.cargar({ page: this.pagina }));
  }

  crearNuevo(): void {
    console.log('Crear inmueble');
    // this.router.navigate(['/inmuebles/crear']);
  }

  volver(): void {
    history.back();
  }

  // Helpers UI
  dirCompleta(inm: Inmueble): string {
    return (
      (inm as any)?.Direccion?.DireccionCompleta ||
      [(inm as any)?.Direccion?.Calle, (inm as any)?.Direccion?.Numero].filter(Boolean).join(' ') ||
      ''
    );
  }
}
