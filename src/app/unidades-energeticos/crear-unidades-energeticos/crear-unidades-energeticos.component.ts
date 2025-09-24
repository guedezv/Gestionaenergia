// src/app/unidades-energeticos/crear-unidades-energeticos/crear-unidades-energeticos.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FooterComponent } from '../../footer/footer.component';

// ✅ Ruta correcta al service
import { UnidadesEnergeticosService } from '../../services/unidades-energeticos.service';

@Component({
  selector: 'app-crear-unidades-energeticos',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './crear-unidades-energeticos.component.html',
  styleUrls: ['./crear-unidades-energeticos.component.scss']
})
export class CrearUnidadesEnergeticosComponent {
  nombre = '';
  abrev  = '';
  loading = false;
  saving  = false;
  error   = '';

  constructor(
    private service: UnidadesEnergeticosService,
    private router: Router
  ) {}

  guardar(): void {
    this.error = '';
    const nombre = this.nombre.trim();
    const abrev  = this.abrev.trim();

    if (!nombre) {
      this.error = 'El nombre es requerido.';
      return;
    }

    this.saving = true;

    const payload: any = { Nombre: nombre };
    if (abrev) payload.Abreviatura = abrev;

    this.service.createUnidad(payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/unidades-energeticos'], {
          state: { toast: { type: 'success', text: 'Unidad creada correctamente.' } }
        });
      },
      error: (err: any) => {
        console.error('[CrearUnidad] error:', err);
        this.saving = false;
        this.error = 'No se pudo crear la unidad.';
      }
    });
  }

  volver(): void {
    this.router.navigate(['/unidades-energeticos']);
  }
}
