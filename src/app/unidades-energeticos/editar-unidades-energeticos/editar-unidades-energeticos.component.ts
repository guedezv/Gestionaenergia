import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FooterComponent } from '../../footer/footer.component';

import {
  UnidadesEnergeticosService,
  UnidadMedida
} from '../../services/unidades-energeticos.service';

@Component({
  selector: 'app-editar-unidades-energeticos',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './editar-unidades-energeticos.component.html',
  styleUrls: ['./editar-unidades-energeticos.component.scss']
})
export class EditarUnidadesEnergeticosComponent implements OnInit {
  id!: number | string;

  form: { Nombre: string; Abreviatura: string } = { Nombre: '', Abreviatura: '' };

  loading = true;
  saving = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private unidadesSrv: UnidadesEnergeticosService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') as string;
    this.cargar();
  }

  private cargar(): void {
    this.loading = true;
    this.error = '';
    this.unidadesSrv.getUnidadById(this.id).subscribe({
      next: (u: UnidadMedida) => {
        this.form.Nombre = u?.Nombre ?? '';
        this.form.Abreviatura = u?.Abreviatura ?? '';
        this.loading = false;
      },
      error: (_err: any) => {
        this.loading = false;
        this.error = 'No se pudo cargar la unidad.';
      }
    });
  }

  guardar(): void {
    if (this.saving) return;
    if (!this.form.Nombre.trim()) {
      this.error = 'El nombre es requerido.';
      return;
    }
    this.saving = true;
    this.error = '';

    // El PUT del swagger acepta sólo { Nombre }
    this.unidadesSrv.updateUnidadNombre(this.id, this.form.Nombre.trim()).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/unidades-energeticos'], {
          state: { toast: { type: 'success', text: 'Unidad actualizada correctamente.' } }
        });
      },
      error: (_err: any) => {
        this.saving = false;
        this.error = 'No se pudo actualizar la unidad.';
      }
    });
  }

  volver(): void {
    history.back();
  }
}
