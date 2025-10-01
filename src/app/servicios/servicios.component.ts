import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

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
  // datos
  servicios: Servicio[] = [];
  serviciosPaginados: Servicio[] = [];
  instituciones: InstitucionLite[] = [];

  // filtros (accionan solo al pulsar el botón "Filtrar")
  filtroTexto = '';
  institucionSeleccionada: number | null = null;

  // paginación
  paginaActual = 1;
  tamanoPagina = 10;
  totalPaginas = 0;

  // estado
  loading = true;
  error = '';
  toast: { type: 'success' | 'error' | 'info'; text: string } | null = null;

  constructor(
    private serviciosService: ServiciosService,
    private institucionesService: InstitucionesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // toast opcional
    const st: any = history.state;
    if (st?.toast?.text) {
      this.toast = st.toast;
      try { history.replaceState({ ...st, toast: undefined }, ''); } catch {}
    }

    // 1) instituciones
    this.institucionesService.getInstituciones().subscribe({
      next: (lista: any[]) => {
        this.instituciones = (lista ?? [])
          .map(i => ({ Id: i?.Id ?? i?.id, Nombre: i?.Nombre ?? i?.nombre ?? i?.name ?? '' }))
          .filter(i => Number.isFinite(i.Id) && i.Nombre);
      },
      error: () => { this.instituciones = []; }
    });

    // 2) servicios (primera carga = TODOS)
    this.cargarServicios(null);
  }

  /** Convierte a number o null, porque el select puede entregar string */
  onInstChange(val: any): void {
    this.institucionSeleccionada = (val === null || val === undefined || val === '')
      ? null
      : Number(val);
    if (!Number.isFinite(this.institucionSeleccionada as number)) this.institucionSeleccionada = null;
  }

  /** Llama al backend con o sin InstitucionId y luego aplica filtro por texto */
  aplicarFiltro(): void {
    this.cargarServicios(this.institucionSeleccionada, this.filtroTexto);
  }

  /** Restablece filtros y recarga todo */
  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.institucionSeleccionada = null;
    this.cargarServicios(null);
  }
  // ⭐ Campo para bloquear el switch mientras hace PATCH
togglingId: number | null = null;

// Lee “activo” tolerando nombres distintos
isActivo(s: any): boolean {
  return !!(s?.Active ?? s?.Activo ?? s?.active ?? s?.Estado ?? s?.estado);
}

// Escribe “activo” donde corresponda
private setActivo(s: any, val: boolean): void {
  if ('Active' in s) s.Active = val;
  else if ('Activo' in s) s.Activo = val;
  else if ('active' in s) s.active = val;
  else s.Active = val; // crea la prop si no existe
}

// Handler del switch
onToggleEstado(srv: Servicio, nuevoValor: boolean): void {
  if (!srv?.Id) return;

  const anterior = this.isActivo(srv);
  this.setActivo(srv, nuevoValor);   // optimista
  this.togglingId = srv.Id;

  this.serviciosService.updateEstadoServicio(srv.Id, nuevoValor).subscribe({
    next: () => {
      this.togglingId = null;
      this.toast = { type: 'success', text: `Servicio ${nuevoValor ? 'activado' : 'desactivado'}.` };
    },
    error: (err) => {
      // revertir si falla
      this.setActivo(srv, anterior);
      this.togglingId = null;
      this.toast = { type: 'error', text: this.humanizarError(err) };
    }
  });
}


  /** Carga desde el backend; si falla intenta dejar un mensaje amigable */
private cargarServicios(instId: number | null, texto?: string): void {
  this.loading = true;
  this.error = '';

  const opts = instId != null ? { InstitucionId: instId } : undefined;

  console.log('🔄 Llamando a getServiciosDeUsuarioActual con:', opts);

  this.serviciosService.getServiciosDeUsuarioActual(1, 200, opts).subscribe({
    next: (lista) => {
      console.log('✅ Respuesta del backend:', lista); // <-- LOG BACKEND

      const q = this.normalize(texto ?? '');

      this.servicios = !q
        ? lista
        : lista.filter(s => this.normalize(s?.Nombre ?? '').includes(q));

      console.log('📋 Lista filtrada (frontend):', this.servicios); // <-- LOG FILTRADA

      this.paginaActual = 1;
      this.actualizarPaginacion();

      this.loading = false;
    },
    error: (err) => {
      console.error('[Servicios] ❌ Error en GET:', err);
      this.error = this.humanizarError(err);
      this.servicios = [];
      this.serviciosPaginados = [];
      this.loading = false;
    }
  });
}


  actualizarPaginacion(): void {
    const total = this.servicios.length;
    this.totalPaginas = Math.max(1, Math.ceil(total / this.tamanoPagina));
    const start = (this.paginaActual - 1) * this.tamanoPagina;
    const end = start + this.tamanoPagina;
    this.serviciosPaginados = this.servicios.slice(start, end);
  }

  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaActual = p;
      this.actualizarPaginacion();
    }
  }

  editarServicio(srv: Servicio): void {
    if (!srv?.Id) return;
    this.router.navigate(['/servicios/editar', srv.Id], { state: { servicio: srv } });
  }

  eliminarServicio(srv: Servicio): void {
    console.log('Eliminar servicio (pendiente)', srv);
  }

  crearNuevoServicio(): void {
    this.router.navigate(['/servicios/crear']);
  }

  volver(): void { history.back(); }

  private normalize(v: string): string {
    return (v || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private humanizarError(err: any): string {
    if (err?.status === 401) return 'No autorizado (token inválido o expirado).';
    if (err?.status === 404) return 'Endpoint no encontrado.';
    if (err?.status === 422) return 'Parámetros inválidos (revise filtros).';
    if (err?.status === 500) return 'Error interno del servidor.';
    return 'No se pudieron cargar los servicios.';
  }
}
