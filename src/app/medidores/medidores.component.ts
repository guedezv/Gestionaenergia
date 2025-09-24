import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Layout
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

// Services
import { MedidoresService, Medidor } from '../services/medidores.service';
import { InstitucionesService } from '../services/instituciones.service';
import { ServiciosService } from '../services/servicios.service';

type Lite = { Id: number; Nombre: string };
type ServicioLite = { Id: number; Nombre: string; InstitucionId: number | null };
type PageItem = number | '…';

@Component({
  selector: 'app-medidores',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './medidores.component.html',
  styleUrls: ['./medidores.component.scss']
})
export class MedidoresComponent implements OnInit {
  // data
  medidores: Medidor[] = [];

  instituciones: Lite[] = [];
  serviciosTodos:  ServicioLite[] = [];
  serviciosFiltrados: ServicioLite[] = [];

  // ui state
  loading = true;
  error = '';

  // filters (solo se aplica al pulsar "Filtrar")
  filtroTexto = '';                         // ID / Número / Cliente
  institucionSeleccionada: number | null = null; // “Ministerio”
  servicioSeleccionado: number | null = null;    // “Servicio”

  // pagination (fija)
  pagina = 1;
  pageSize = 10; // tamaño fijo; sin selector
  total = 0;
  totalPaginas = 1;

  constructor(
    private medidoresService: MedidoresService,
    private institucionesService: InstitucionesService,
    private serviciosService: ServiciosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  /* ======== CATALOGO ======== */
  private cargarCatalogos(): void {
    this.loading = true;
    this.error = '';

    // Instituciones
    this.institucionesService.getInstituciones().subscribe({
      next: (lista: any[]) => {
        this.instituciones = (lista ?? []).map(i => ({
          Id: Number(i?.Id ?? i?.id),
          Nombre: i?.Nombre ?? i?.nombre ?? i?.name ?? ''
        })).filter(i => Number.isFinite(i.Id) && i.Nombre);
      },
      error: () => { this.instituciones = []; }
    });

    // Servicios
    this.serviciosService.getServiciosDeUsuarioActual().subscribe({
      next: (lista: any[]) => {
        this.serviciosTodos = (lista ?? []).map(s => ({
          Id: Number(s?.Id ?? s?.id),
          Nombre: s?.Nombre ?? s?.nombre ?? s?.name ?? '',
          InstitucionId: this.extraerInstitucionId(s)
        })).filter(s => Number.isFinite(s.Id));
        this.refreshServiciosFiltrados();
        this.cargarLista(1); // ← primera carga
      },
      error: () => {
        this.serviciosTodos = [];
        this.refreshServiciosFiltrados();
        this.cargarLista(1);
      }
    });
  }

  /* ======== CARGA LISTA desde API ======== */
  private cargarLista(page: number = 1): void {
    this.loading = true;
    this.error = '';

    const DivisionId = this.servicioSeleccionado ?? null;

    this.medidoresService.list({
      q: this.filtroTexto,   // el service normaliza a '1' si va vacío
      page,
      pageSize: this.pageSize,
      DivisionId
    }).subscribe({
      next: ({ items, total }) => {
        // Si sólo seleccionaste Ministerio (institución) y NO servicio,
        // filtramos en cliente por InstitucionId
        const instId = this.institucionSeleccionada;
        const itemsFiltrados = (instId != null)
          ? items.filter(m => this.extraerInstitucionId(m) === instId)
          : items;

        this.medidores = itemsFiltrados;
        this.total = total ?? itemsFiltrados.length;
        this.pagina = page;
        this.totalPaginas = Math.max(1, Math.ceil((this.total || 0) / this.pageSize));
        this.loading = false;
      },
      error: (err) => {
        console.error('[Medidores] error:', err);
        this.error = 'No se pudieron cargar los medidores.';
        this.loading = false;
      }
    });
  }

  /* ======== FILTROS ======== */
  onChangeInstitucion(): void {
    this.servicioSeleccionado = null;
    this.refreshServiciosFiltrados();
  }

  private refreshServiciosFiltrados(): void {
    if (this.institucionSeleccionada == null) {
      this.serviciosFiltrados = this.serviciosTodos.slice();
    } else {
      const id = Number(this.institucionSeleccionada);
      this.serviciosFiltrados = this.serviciosTodos.filter(s => Number(s.InstitucionId) === id);
    }
  }

  aplicarFiltro(): void {
    this.pagina = 1;
    this.cargarLista(1);
  }

  /* ======== PAGINACIÓN ======== */
  irA(p: number | string): void {
    // Evitar NaN / '…'
    const n = Number(p);
    if (!Number.isFinite(n)) return;
    if (n < 1 || n > this.totalPaginas || n === this.pagina) return;
    this.cargarLista(n);
  }

  irPrimera(): void {
    if (this.pagina !== 1) this.cargarLista(1);
  }

  irUltima(): void {
    if (this.pagina !== this.totalPaginas) this.cargarLista(this.totalPaginas);
  }

  get pageItems(): PageItem[] {
    // Ventana: 1, …, (c-2)(c-1) c (c+1)(c+2), …, last
    const total = this.totalPaginas;
    const current = this.pagina;
    const delta = 2;
    if (total <= 10) return Array.from({ length: total }, (_, i) => i + 1);

    const range: number[] = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }
    const items: PageItem[] = [];
    let prev: number | undefined;
    for (const num of range) {
      if (prev !== undefined) {
        if (num - prev === 2) items.push(prev + 1);
        else if (num - prev > 2) items.push('…');
      }
      items.push(num);
      prev = num;
    }
    return items;
  }

  /* ======== ACCIONES ======== */
editar(m: Medidor): void {
  // Navega al editor con el Id del medidor
  this.router.navigate(['/medidores/editar', m.Id]);
}


  /* ======== HELPERS ======== */
  esSiNo(v: any): 'Si' | 'No' {
    return v ? 'Si' : 'No';
  }

  esActivo(m: Medidor): boolean {
    return !!(m.Active ?? (m as any)['Activo']);
  }

  private extraerInstitucionId(s: any): number | null {
    const val =
      s?.InstitucionId ??
      s?.institucionId ??
      s?.Servicio?.InstitucionId ??
      s?.Unidad?.InstitucionId ??
      null;

    if (val == null) return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  }
}
