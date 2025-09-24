// src/app/instituciones/editar-institucion/editar-institucion.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { InstitucionesService, Institucion } from '../../services/instituciones.service';

// Layout
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FooterComponent } from '../../footer/footer.component';

@Component({
  selector: 'app-editar-institucion',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './editar-institucion.component.html',
  styleUrls: ['./editar-institucion.component.scss']
})
export class EditarInstitucionComponent implements OnInit {
  id!: number;
  institucion: Institucion | null = null;
  nombre: string = '';
  cargando = true;
  errorCarga = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private institucionesService: InstitucionesService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.institucionesService.getInstitucionById(this.id).subscribe({
      next: (inst) => {
        this.institucion = inst;
        this.nombre = inst.Nombre || '';
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error obteniendo institución', err);
        this.errorCarga = err?.status === 401
          ? 'No autorizado. Inicia sesión nuevamente.'
          : 'No se pudo cargar la institución.';
        this.cargando = false;
      }
    });
  }

  guardar(): void {
    if (!this.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    this.institucionesService.updateInstitucion(this.id, { Nombre: this.nombre.trim() }).subscribe({
      next: (actualizada) => {
        alert('Institución actualizada con éxito');
        this.router.navigate(['/instituciones']);
      },
      error: (err) => {
        console.error('Error actualizando institución', err);
        if (err?.status === 401) {
          alert('No autorizado. Inicia sesión nuevamente.');
        } else if (err?.status === 422) {
          alert('Datos inválidos (422). Revisa el nombre.');
        } else {
          alert('Error al actualizar la institución');
        }
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/instituciones']);
  }
}
