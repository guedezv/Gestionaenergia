import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FooterComponent } from '../../footer/footer.component';

import { ServiciosService } from '../../services/servicios.service';
import { InstitucionesService } from '../../services/instituciones.service';

type InstitucionLite = { Id: number; Nombre: string };

type UpdateServicioPayload = {
  Nombre: string;
  Identificador: string;
  ReportaPMG: boolean;
  InstitucionId: number;
  PgaRevisionRed: boolean;
  RevisionRed: boolean;
  ValidacionConcientizacion: boolean;
};

@Component({
  selector: 'app-editar-servicio',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './editar-servicio.component.html',
  styleUrls: ['./editar-servicio.component.scss']
})
export class EditarServicioComponent implements OnInit {
  id!: number;

  // Form model
  form: UpdateServicioPayload = {
    Nombre: '',
    Identificador: '',
    ReportaPMG: false,
    InstitucionId: 0,
    PgaRevisionRed: false,
    RevisionRed: false,
    ValidacionConcientizacion: false
  };

  // Meta (solo lectura en la UI)
  meta = {
    activo: null as boolean | null,
    version: '' as string | number,
    createdAt: '' as string,
    updatedAt: '' as string,
    createdBy: '' as string,
    modifiedBy: '' as string
  };

  instituciones: InstitucionLite[] = [];

  loading = true;
  saving = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviciosService: ServiciosService,
    private institucionesService: InstitucionesService
  ) {}

  ngOnInit(): void {
    // 1) id desde /servicios/editar/:id
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    // 2) cargar instituciones (para el <select>)
    this.institucionesService.getInstituciones().subscribe({
      next: (list: any[]) => {
        this.instituciones = (list ?? [])
          .map(i => ({
            Id: i?.Id ?? i?.id,
            Nombre: i?.Nombre ?? i?.nombre ?? i?.name ?? ''
          }))
          .filter(x => x.Id && x.Nombre);
      },
      error: () => { /* silencioso */ }
    });

    // 3) cargar datos del servicio (sin GET por id)
    this.cargarServicio();
  }

  /** Intenta precargar desde history.state.servicio;
   * si no viene, obtiene los servicios del usuario y busca por id.
   */
  private cargarServicio(): void {
  const st: any = history.state;
  const fromState = st?.servicio;

  if (fromState?.Id) {
    this.aplicarServicio(fromState);
    this.loading = false;
    return;
  }

  // ❗ Máximo permitido por la API: 200
  const SAFE_PAGE_SIZE = 200;

  this.serviciosService.getServiciosDeUsuarioActual(1, SAFE_PAGE_SIZE).subscribe({
    next: (arr) => {
      const s = (arr ?? []).find(x => Number((x as any)?.Id) === this.id);
      if (!s) {
        this.error = 'Servicio no encontrado para el usuario.';
      } else {
        this.aplicarServicio(s);
      }
      this.loading = false;
    },
    error: (err) => {
      // Si vuelve 422 por validación, deja un mensaje claro
      if (err?.status === 422) {
        this.error = 'Parámetros inválidos al consultar servicios (revisa page/page_size).';
      } else {
        this.error = this.humanizarError(err);
      }
      this.loading = false;
    }
  });
}

  /** Mapea el objeto servicio de la API al formulario y meta */
  private aplicarServicio(s: any): void {
    this.form = {
      Nombre: s?.Nombre ?? '',
      Identificador: s?.Identificador ?? '',
      ReportaPMG: !!s?.ReportaPMG,
      InstitucionId: Number(s?.InstitucionId ?? s?.Institucion?.Id ?? 0),
      PgaRevisionRed: !!s?.PgaRevisionRed,
      RevisionRed: !!(s?.RevisionRed ?? s?.AlcanceDiagnostico),
      ValidacionConcientizacion: !!s?.ValidacionConcientizacion
    };

    this.meta = {
      activo: s?.Active ?? null,
      version: s?.Version ?? '',
      createdAt: this.fmtFecha(s?.CreatedAt ?? s?.createdAt),
      updatedAt: this.fmtFecha(s?.UpdatedAt ?? s?.updatedAt),
      createdBy: s?.CreatedBy ?? s?.UsuarioCreacion ?? '',
      modifiedBy: s?.ModifiedBy ?? s?.UsuarioUltimaModificacion ?? ''
    };
  }

  guardar(): void {
    if (this.saving) return;
    this.saving = true;
    this.error = '';

    const payload: UpdateServicioPayload = { ...this.form };

    this.serviciosService.updateServicio(this.id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/servicios'], {
          state: { toast: { type: 'success', text: 'Servicio actualizado correctamente.' } }
        });
      },
      error: (err) => {
        this.saving = false;
        this.error = this.humanizarError(err);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/servicios']);
  }

  // utilidades
  private fmtFecha(v: any): string {
    if (!v) return '';
    try {
      const d = new Date(v);
      if (isNaN(d.getTime())) return String(v);
      return d.toLocaleString();
    } catch {
      return String(v);
    }
  }

  private humanizarError(err: any): string {
    if (err?.status === 401) return 'No autorizado.';
    if (err?.status === 404) return 'Servicio no encontrado.';
    if (err?.status === 422) return 'Datos inválidos.';
    if (err?.status === 500) return 'Error interno del servidor.';
    return 'No se pudo actualizar el servicio.';
  }
}
