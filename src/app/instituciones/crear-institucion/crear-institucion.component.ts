import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Servicios y modelos
import { InstitucionesService, Institucion } from '../../services/instituciones.service';

// Componentes de layout
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FooterComponent } from '../../footer/footer.component';

@Component({
  selector: 'app-crear-institucion',
  standalone: true,
  // 👇 Aquí agregamos los componentes de layout además de CommonModule y FormsModule
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './crear-institucion.component.html',
  styleUrls: ['./crear-institucion.component.scss']
})
export class CrearInstitucionComponent {
  nuevaInstitucion: Partial<Institucion> = {
    Nombre: ''
  };

  constructor(
    private institucionesService: InstitucionesService,
    private router: Router
  ) {}

  guardar(): void {
    this.institucionesService.createInstitucion(this.nuevaInstitucion as Institucion).subscribe({
      next: () => {
        alert('Institución creada con éxito');
        this.router.navigate(['/instituciones']); // volver al listado
      },
      error: (err) => {
        console.error('Error al crear institución', err);
        alert('Error al crear la institución');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/instituciones']);
  }
}
