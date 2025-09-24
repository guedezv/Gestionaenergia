import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService, Usuario } from '../services/usuarios.service';

// layout
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosPaginados: Usuario[] = [];

  // estado
  loading = true;
  error = '';

  // paginación
  paginaActual = 1;
  tamanoPagina = 10;
  totalPaginas = 0;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data || [];
        this.actualizarPaginacion();
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar usuarios';
        this.loading = false;
      }
    });
  }

  // === paginación ===
  private actualizarPaginacion(): void {
    const total = this.usuarios.length;
    this.totalPaginas = Math.max(1, Math.ceil(total / this.tamanoPagina));
    const start = (this.paginaActual - 1) * this.tamanoPagina;
    const end = start + this.tamanoPagina;
    this.usuariosPaginados = this.usuarios.slice(start, end);
  }

  cambiarPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.actualizarPaginacion();
  }

  // botones inferiores (stub)
  crearNuevoUsuario(): void {
    console.log('Crear nuevo usuario'); // aquí puedes navegar si ya tienes la ruta
    // this.router.navigate(['/usuarios/crear']);
  }
  volver(): void {
    history.back();
  }
}
