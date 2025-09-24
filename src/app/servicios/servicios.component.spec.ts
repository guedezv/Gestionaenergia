import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// layout
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

// servicios
import { ServiciosService, Servicio } from '../services/servicios.service';
import { InstitucionesService } from '../services/instituciones.service';

type InstitucionLite = { Id: number; Nombre: string };

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.scss']
})
export class ServiciosComponent implements OnInit {
  // dataset
  servicios: Servicio[] = [];
  serviciosFiltrados: Servicio[] = [];
  serviciosPaginados: Servicio[] = [];

  // filtros
  filtro = '';
  institucionSeleccionada: number | null = null;

  // instituciones (para el select)
  institucionesLista: InstitucionLite[] = [];

  // ui
  paginaActual = 1;
  tamanoPagina = 10;
  totalPaginas = 0;
  loading = true;
  error = '';

  // toast opcional
  toast: { type: 'success' | 'error' | 'info'; text: string } | null = null;

  // cache de nombres por id (si viene desde InstitucionesService)
  private mapaNombresInstitucion = new Map<number, string>();

  constructor(
    private serviciosService: ServiciosService,
    private institucionesService: InstitucionesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // lee toast (si volvió de crear/editar)
    const st: any = history.state;
    if (st?.toast?.text) {
      this.toast = st.toast;
      try { history.replaceState({ ...st, toast: undefined }, ''); } catch {}
    }

    // Carga instituciones (para nombres)
    this.institucionesService.getInstituciones().subscribe({
      next: (lista: any[]) => {
        for (const i of (lista ?? [])) {
          const id = Number(i?.['Id'] ?? i?.['id']);
          const nom = String(i?.['Nombre'] ?? i?.['nombre'] ?? i?.['name'] ?? '');
          if (Number.isFinite(id) && nom) this.mapaNombresInstitucion.set(id, nom);
        }
      },
      error: () => { /* silencioso */ }
    });

    // Carga servicios
    this.serviciosService.getServiciosDeUsuarioActual().subscribe({
      next: (data) => {
        // normaliza Nombre
        const lista = (data ?? []).map((s: any) => ({
          ...s,
          Nombre: s?.['Nombre'] ?? s?.['nombre'] ?? s?.['name'] ?? ''
        })) as Servicio[];

        this.servicios = lista;

        // 1) Construye el select de instituciones desde los servicios
        this.institucionesLista = this.construirInstitucionesDesdeServicios(this.servicios);

        // 2) Muestra TODO inicialmente (premisa)
        this.serviciosFiltrados = this.servicios.slice();
        this.paginaActual = 1;
        this.actualizarPaginacion();

        this.loading = false;
      },
      error: (err) => {
        console.error('[Servicios] error:', err);
        this.error = this.humanizarError(err);
        this.loading = false;
      }
    });
  }

  /** Construye las instituciones presentes en los servicios (únicas) */
  private construirInstitucionesDesdeServicios(servs: Servicio[]): InstitucionLite[] {
    const ids = new Set<number>();
    const items: InstitucionLite[] = [];

    for (const s of (servs ?? [])) {
      const id = this.extraerInstitucionId(s);
      if (id == null || ids.has(id)) continue;
      ids.add(id);

      // nombre: prioridad mapa → campo dentro del servicio → fallback
      const nombreDesdeMapa = this.mapaNombresInstitucion.get(id);
      const nombreDesdeSrv =
        s?.['Institucion']?.['Nombre'] ??
        s?.['institucion']?.['Nombre'] ??
        s?.['InstitucionNombre'] ??
        s?.['institucionNombre'];

      const nom = nombreDesdeMapa || nombreDesdeSrv || `Institución ${id}`;
      items.push({ Id: id, Nombre: String(nom) });
    }

    // si nunca se encontró un id, dejamos el select vacío (se deshabilita en HTML)
    return items.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
  }

  /** Botón Filtrar: aplica nombre + institución */
  aplicarFiltro(): void {
    const q = this.normalizeText(this.filtro);
    const instId = this.institucionSeleccionada != null ? Number(this.institucionSeleccionada) : null;

    this.serviciosFiltrados = (this.servicios ?? []).filter((s) => {
      const name = this.normalizeText(s?.['Nombre'] ?? '');
      const byName = !q || name.includes(q);

      const sid = this.extraerInstitucionId(s);
      const byInst = instId == null || (sid != null && Number(sid) === instId);

      return byName && byInst;
    });

    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  /** Botón Limpiar: vuelve a mostrar todo y resetea controles */
  limpiarFiltros(): void {
    this.filtro = '';
    this.institucionSeleccionada = null;
    this.serviciosFiltrados = this.servicios.slice();
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    const total = this.serviciosFiltrados?.length || 0;
    this.totalPaginas = Math.max(1, Math.ceil(total / this.tamanoPagina));
    const start = (this.paginaActual - 1) * this.tamanoPagina;
    const end = start + this.tamanoPagina;
    this.serviciosPaginados = this.serviciosFiltrados.slice(start, end);
  }

  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaActual = p;
      this.actualizarPaginacion();
    }
  }

  editarServicio(srv: Servicio): void {
    const id = Number(srv?.['Id']);
    if (!Number.isFinite(id)) return;
    this.router.navigate(['/servicios/editar', id], { state: { servicio: srv } });
  }

  eliminarServicio(_srv: Servicio): void {
    console.log('Eliminar servicio - pendiente');
  }

  crearNuevoServicio(): void {
    this.router.navigate(['/servicios/crear']);
  }

  volver(): void {
    history.back();
  }

  /** Lee InstitucionId en varias formas (si no hay, retorna null) */
  private extraerInstitucionId(s: any): number | null {
    const val =
      s?.['InstitucionId'] ??
      s?.['InstitucionID'] ??
      s?.['institucionId'] ??
      s?.['institucionID'] ??
      s?.['InstitutionId'] ??
      s?.['institutionId'] ??
      s?.['Institucion']?.['Id'] ??
      s?.['institucion']?.['Id'] ??
      null;

    if (val == null) return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  }

  private normalizeText(v: string): string {
    return (v || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private humanizarError(err: any): string {
    if (err?.status === 401) return 'No autorizado (token inválido o expirado).';
    if (err?.status === 404) return 'Endpoint no encontrado.';
    if (err?.status === 500) return 'Error interno del servidor.';
    return 'No se pudieron cargar los servicios.';
  }
}
