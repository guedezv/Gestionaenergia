import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FooterComponent } from '../../footer/footer.component';

import { RolesService, Rol } from '../../services/roles.service';

@Component({
  selector: 'app-crear-rol',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './crear-rol.component.html',
  styleUrls: ['./crear-rol.component.scss']
})
export class CrearRolComponent implements OnInit {
  // Si viene un rol → renombrar; si no, “crear”
  roleId: string | number | null = null;
  nombre = '';

  loading = false;
  saving  = false;
  error   = '';

  constructor(
    private rolesService: RolesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // 1) Intento via router state desde la lista
    const st: any = history.state;
    if (st?.rol) {
      const r: Rol = st.rol;
      this.roleId = r.Id;
      this.nombre = r.Nombre ?? r['Name'] ?? '';
      return;
    }

    // 2) O por parámetro /roles/crear/:id (lo usas como “editar”)
    const p = this.route.snapshot.paramMap.get('id');
    if (p) {
      this.roleId = isNaN(Number(p)) ? p : Number(p);
      this.loading = true;

      this.rolesService.getRolById(this.roleId).subscribe({
        next: (r: Rol) => {
          this.nombre = r?.Nombre ?? r['Name'] ?? '';
          this.loading = false;
        },
        error: (_err: any) => {
          this.loading = false;
          this.error = 'No se pudo cargar el rol.';
        }
      });
    }
  }

  guardar(): void {
    this.error = '';
    const nombreLimpio = (this.nombre || '').trim();

    if (!nombreLimpio) {
      this.error = 'El nombre es requerido.';
      return;
    }

    this.saving = true;

    // Selecciona la operación según haya o no roleId
    const obs = this.roleId
      ? this.rolesService.renameRole(this.roleId, nombreLimpio) // PUT /roles/{id} { Name }
      : this.rolesService.createRole(nombreLimpio);             // POST /roles { Name }

    obs.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        this.afterSave(this.roleId ? 'Rol actualizado correctamente.' : 'Rol creado correctamente.');
      },
      error: (err: any) => this.handleError(err)
    });
  }

  private afterSave(msg: string): void {
    this.router.navigate(['/roles'], {
      state: { toast: { type: 'success', text: msg } }
    });
  }

  private handleError(err: any): void {
    console.error('[CrearRol] error:', err);
    this.error = 'No se pudo guardar el rol.';
  }

  volver(): void {
    this.router.navigate(['/roles']);
  }
}
