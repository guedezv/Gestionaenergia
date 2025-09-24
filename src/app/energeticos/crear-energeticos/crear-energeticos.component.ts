import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FooterComponent } from '../../footer/footer.component';

import {
  EnergeticosService,
  CreateEnergeticoPayload
} from '../../services/energeticos.service';

@Component({
  selector: 'app-crear-energeticos',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './crear-energeticos.component.html',
  styleUrls: ['./crear-energeticos.component.scss']
})
export class CrearEnergeticosComponent {
  form: CreateEnergeticoPayload = {
    Nombre: '',
    Icono: '',
    Multiple: false,
    PermiteMedidor: false,
    Posicion: 0,
    PermitePotenciaSuministrada: false,
    PermiteTipoTarifa: false
  };

  saving = false;
  error = '';

  constructor(
    private service: EnergeticosService,
    private router: Router
  ) {}

  guardar(): void {
    this.error = '';
    if (!this.form.Nombre.trim()) {
      this.error = 'El nombre es obligatorio.';
      return;
    }

    this.saving = true;
    const payload: CreateEnergeticoPayload = {
      ...this.form,
      Posicion: Number(this.form.Posicion) || 0
    };

    this.service.createEnergetico(payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/energeticos'], {
          state: { toast: { type: 'success', text: 'Energético creado correctamente.' } }
        });
      },
      error: (err) => {
        this.saving = false;
        this.error = this.humanizarError(err);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/energeticos']);
  }

  private humanizarError(err: any): string {
    if (err?.status === 401) return 'No autorizado.';
    if (err?.status === 422) return 'Datos inválidos. Revisa los campos.';
    if (err?.status === 500) return 'Error interno del servidor.';
    return 'No se pudo crear el energético.';
    }
}
