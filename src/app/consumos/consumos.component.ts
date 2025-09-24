// src/app/consumos/consumos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Layout
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

// Services
import { ConsumosService } from '../services/consumos.service';
import { InstitucionesService } from '../services/instituciones.service';
import { ServiciosService } from '../services/servicios.service';
import { EmpresasDistribuidorasService } from '../services/empresas-distribuidoras.service';

type Lite = { Id: number; Nombre: string };
type ServicioLite = { Id: number; Nombre: string; InstitucionId: number | null };

export interface Compra {
  Id: number | string;
  DivisionId?: number | null;
  EnergeticoId?: number | null;
  NumeroClienteId?: number | null;
  FechaCompra?: string | null;
  Consumo?: number | null;
  Costo?: number | null;
  InicioLectura?: string | null;
  FinLectura?: string | null;
  Active?: boolean | null;

  // UI extras
  UnidadNombre?: string | null;
  RevisadoPor?: string | null;
  [k: string]: any;
}

@Component({
  selector: 'app-consumos',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './consumos.component.html',
  styleUrls: ['./consumos.component.scss']
})
export class ConsumosComponent implements OnInit {
  // data
  compras: Compra[] = [];

  instituciones: Lite[] = [];
  serviciosTodos:  ServicioLite[] = [];
  serviciosFiltrados: ServicioLite[] = [];
  energeticos: Lite[] = [];
  private energeticosMap: Record<number, string> = {};

  // filtros
  filtroTexto = '';
  institucionSeleccionada: number | null = null;
  servicioSeleccionado: number | null = null;     // DivisionId
  energeticoSeleccionado: number | null = null;   // EnergeticoId
  numeroClienteId: number | null = null;          // NumeroClienteId
  fechaDesde: string | null = null;               // YYYY-MM-DD
  fechaHasta: string | null = null;               // YYYY-MM-DD

  // paginación
  pagina = 1;
  pageSize = 50; // el swagger usa 50 por defecto
  total = 0;
  totalPaginas = 1;

  // ui
  loading = true;
  error = '';

  constructor(
    private consumosService: ConsumosService,
    private institucionesService: InstitucionesService,
    private serviciosService: ServiciosService,
    private empresasDistribService: EmpresasDistribuidorasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  private cargarCatalogos(): void {
    this.loading = true;
    this.error = '';

    // 1) instituciones
    this.institucionesService.getInstituciones().subscribe({
      next: (lista: any[]) => {
        this.instituciones = (lista ?? []).map(i => ({
          Id: Number(i?.Id ?? i?.id),
          Nombre: i?.Nombre ?? i?.nombre ?? i?.name ?? ''
        })).filter(i => Number.isFinite(i.Id) && i.Nombre);
      },
      error: () => { this.instituciones = []; }
    });

    // 2) servicios (del usuario)
    this.serviciosService.getServiciosDeUsuarioActual().subscribe({
      next: (lista: any[]) => {
        this.serviciosTodos = (lista ?? []).map(s => ({
          Id: Number(s?.Id ?? s?.id),
          Nombre: s?.Nombre ?? s?.nombre ?? s?.name ?? '',
          InstitucionId: this.extraerInstitucionId(s)
        })).filter(s => Number.isFinite(s.Id));
        this.refreshServiciosFiltrados();
      },
      error: () => {
        this.serviciosTodos = [];
        this.refreshServiciosFiltrados();
      }
    });

    // 3) energéticos
    this.empresasDistribService.getEnergeticos().subscribe({
      next: (data: any[]) => {
        this.energeticos = (data ?? []).map(e => ({
          Id: Number(e?.Id ?? e?.id),
          Nombre: e?.Nombre ?? e?.nombre ?? ''
        })).filter(x => Number.isFinite(x.Id) && x.Nombre);
        this.energeticosMap = Object.fromEntries(this.energeticos.map(e => [e.Id, e.Nombre]));
      },
      error: () => { this.energeticos = []; this.energeticosMap = {}; }
    });

    // 4) primera carga
    this.cargarLista(1);
  }

  /* ======== LISTA desde API ======== */
  private cargarLista(page: number = 1): void {
    this.loading = true;
    this.error = '';

    // normalizamos fechas: si sólo viene una, se deja; si vienen ambas y están invertidas, se corrige
    let fDesde = this.fechaDesde || null;
    let fHasta = this.fechaHasta || null;
    if (fDesde && fHasta && fDesde > fHasta) [fDesde, fHasta] = [fHasta, fDesde];

    this.consumosService.list({
      q: this.filtroTexto?.trim() || null,
      page,
      pageSize: this.pageSize,
      DivisionId: this.servicioSeleccionado ?? null,
      EnergeticoId: this.energeticoSeleccionado ?? null,
      NumeroClienteId: this.numeroClienteId ?? null,
      FechaDesde: fDesde,
      FechaHasta: fHasta,
      active: true
    }).subscribe({
      next: ({ items, total }) => {
        this.compras = (items ?? []).map(x => this.normalizeCompra(x));
        this.total = total ?? this.compras.length;
        this.pagina = page;
        this.totalPaginas = Math.max(1, Math.ceil(this.total / this.pageSize));
        this.loading = false;
      },
      error: (err) => {
        console.error('[Consumos] error:', err);
        this.error = 'No se pudieron cargar los consumos.';
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
  getPaginasArray(): number[] {
    // ventana deslizante: máx 7 botones
    const total = this.totalPaginas;
    const actual = this.pagina;
    const ventana = 7;

    if (total <= ventana) return Array.from({ length: total }, (_, i) => i + 1);

    const mitad = Math.floor(ventana / 2);
    let ini = Math.max(1, actual - mitad);
    let fin = Math.min(total, ini + ventana - 1);

    if (fin - ini + 1 < ventana) ini = Math.max(1, fin - ventana + 1);
    return Array.from({ length: fin - ini + 1 }, (_, i) => ini + i);
  }

  irA(p: number): void {
    if (p < 1 || p > this.totalPaginas || p === this.pagina) return;
    this.cargarLista(p);
  }
  irPrimera(): void { if (this.pagina !== 1) this.cargarLista(1); }
  irUltima(): void { if (this.pagina !== this.totalPaginas) this.cargarLista(this.totalPaginas); }

  /* ======== HELPERS UI ======== */
  energeticoNombre(id?: number | null): string {
    const name = this.energeticosMap[Number(id || 0)];
    return name || '—';
    }

  fecha(v?: string | null): string {
    if (!v) return '';
    // espera ISO: "YYYY-MM-DDTHH:mm:ss"
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  private normalizeCompra(x: any): Compra {
    return {
      Id: x?.Id ?? x?.id ?? x?.ID,
      DivisionId: x?.DivisionId ?? x?.division_id ?? null,
      EnergeticoId: x?.EnergeticoId ?? x?.energetico_id ?? null,
      NumeroClienteId: x?.NumeroClienteId ?? x?.numero_cliente_id ?? null,
      FechaCompra: x?.FechaCompra ?? x?.fecha_compra ?? null,
      Consumo: x?.Consumo ?? x?.consumo ?? null,
      Costo: x?.Costo ?? x?.costo ?? null,
      InicioLectura: x?.InicioLectura ?? x?.inicio_lectura ?? null,
      FinLectura: x?.FinLectura ?? x?.fin_lectura ?? null,
      Active: x?.Active ?? x?.Activo ?? x?.active ?? true,
      // campos opcionales para UI
      UnidadNombre: x?.UnidadNombre ?? x?.Unidad?.Nombre ?? null,
      RevisadoPor: x?.RevisadoPor ?? null,
      ...x
    };
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

  volver(): void { history.back(); }
}
