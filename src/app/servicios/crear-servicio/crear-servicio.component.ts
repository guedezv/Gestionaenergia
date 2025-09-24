import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FooterComponent } from '../../footer/footer.component';
import { ServiciosService } from '../../services/servicios.service';

// 👇 importa tu servicio de instituciones
import { InstitucionesService } from '../../services/instituciones.service';

type InstitucionLite = { Id: number; Nombre: string };

@Component({
  selector: 'app-crear-servicio',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './crear-servicio.component.html',
  styleUrls: ['./crear-servicio.component.scss']
})
export class CrearServicioComponent implements OnInit {
  saving = false;
  error = '';

  // listado para el select
  instituciones: InstitucionLite[] = [];
  cargandoInstituciones = true;

  // Modelo del formulario (según swagger)
  nuevo: {
    Nombre: string;
    Identificador: string;
    ReportaPMG: boolean;
    InstitucionId: number | null;
  } = {
    Nombre: '',
    Identificador: '',
    ReportaPMG: false,
    InstitucionId: null
  };

  constructor(
    private serviciosService: ServiciosService,
    private institucionesService: InstitucionesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Carga de instituciones para el select
    this.institucionesService.getInstituciones().subscribe({
      next: (lista: any[]) => {
        // normaliza (por si vinieran claves distintas)
        this.instituciones = (lista ?? []).map((i: any) => ({
          Id: i?.Id ?? i?.id,
          Nombre: i?.Nombre ?? i?.nombre ?? i?.name ?? ''
        })).filter((i: any) => i.Id != null && i.Nombre);
        this.cargandoInstituciones = false;
      },
      error: () => {
        this.cargandoInstituciones = false;
        // deja el select deshabilitado
      }
    });
  }

  formValido(): boolean {
    return !!this.nuevo.Nombre?.trim()
        && !!this.nuevo.Identificador?.trim()
        && !!this.nuevo.InstitucionId;
  }

  guardar(): void {
    if (!this.formValido()) return;

    this.saving = true;
    this.error = '';

    this.serviciosService.createServicio({
      Nombre: this.nuevo.Nombre.trim(),
      Identificador: this.nuevo.Identificador.trim(),
      ReportaPMG: !!this.nuevo.ReportaPMG,
      InstitucionId: Number(this.nuevo.InstitucionId)
    }).subscribe({
      next: (creado) => {
        this.saving = false;
        this.router.navigate(['/servicios'], {
          state: {
            toast: {
              type: 'success',
              text: `Servicio "${creado?.Nombre ?? this.nuevo.Nombre}" creado correctamente.`
            }
          }
        });
      },
      error: (err) => {
        this.saving = false;
        this.error = this.humanizarError(err);
      }
    });
  }

  cancelar(): void {
    history.back();
  }

  private humanizarError(err: any): string {
    if (err?.status === 401) return 'No autenticado. Inicia sesión nuevamente.';
    if (err?.status === 403) return 'No autorizado (se requiere rol ADMINISTRADOR).';
    if (err?.status === 422) return 'Datos inválidos. Revisa el formulario.';
    return 'No se pudo crear el servicio.';
  }
}
