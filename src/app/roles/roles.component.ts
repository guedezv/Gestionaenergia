// src/app/roles/roles.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

import { RolesService, Rol } from '../services/roles.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  roles: Rol[] = [];
  rolesFiltrados: Rol[] = [];
  rolesPaginados: Rol[] = [];

  filtro = '';
  paginaActual = 1;
  tamanoPagina = 10;
  totalPaginas = 0;

  loading = true;
  error = '';

  deletingId: string | number | null = null;

  constructor(
    private rolesService: RolesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
  }

  private cargarRoles(): void {
    this.loading = true;
    this.error = '';
    this.rolesService.getRoles().subscribe({
      next: (data) => {
        this.roles = data ?? [];
        this.aplicarFiltro();
        this.loading = false;
      },
      error: (err) => {
        console.error('[Roles] error:', err);
        this.error = this.humanizarError(err);
        this.loading = false;
      }
    });
  }

  aplicarFiltro(): void {
    const q = (this.filtro || '').trim().toLowerCase();
    this.rolesFiltrados = !q
      ? this.roles.slice()
      : this.roles.filter(r => (r?.Nombre || '').toLowerCase().includes(q));

    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    const total = this.rolesFiltrados.length;
    this.totalPaginas = Math.max(1, Math.ceil(total / this.tamanoPagina));
    const start = (this.paginaActual - 1) * this.tamanoPagina;
    const end = start + this.tamanoPagina;
    this.rolesPaginados = this.rolesFiltrados.slice(start, end);
  }

  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaActual = p;
      this.actualizarPaginacion();
    }
  }

  crearNuevoRol(): void {
    // Si usas pantalla para renombrar/crear
    this.router.navigate(['/roles/crear']);
  }

  editarRol(rol: Rol): void {
    this.router.navigate(['/roles/crear'], { state: { rol } });
  }
  volver(): void {
    history.back(); // vuelve a la página anterior
  }

  eliminarRol(rol: Rol): void {
    if (!rol?.Id) return;

    const ok = confirm(`¿Eliminar el rol "${rol.Nombre}"?`);
    if (!ok) return;

    this.deletingId = rol.Id;

    this.rolesService.deleteRole(rol.Id).subscribe({
      next: () => {
        // quitar de la lista local
        this.roles = this.roles.filter(r => r.Id !== rol.Id);
        this.aplicarFiltro(); // recalcula paginación
        this.deletingId = null;
      },
      error: (err) => {
        console.error('[Roles] eliminar error:', err);
        alert(this.humanizarError(err));
        this.deletingId = null;
      }
    });
  }

  private humanizarError(err: any): string {
    if (err?.status === 401) return 'No autorizado.';
    if (err?.status === 403) return 'Sin permisos.';
    if (err?.status === 404) return 'No encontrado.';
    if (err?.status === 422) return 'Datos inválidos.';
    if (err?.status === 500) return 'Error interno del servidor.';
    return 'Ocurrió un error.';
  }
}
