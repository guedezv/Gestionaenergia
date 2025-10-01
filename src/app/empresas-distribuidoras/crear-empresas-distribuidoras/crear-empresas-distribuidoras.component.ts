import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Layout
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FooterComponent } from '../../footer/footer.component';

// Service
import {
  EmpresasDistribuidorasService,
  Energetico,
  Localidad,
  CreateEmpresaPayload
} from '../../services/empresas-distribuidoras.service';

import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-crear-empresas-distribuidoras',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './crear-empresas-distribuidoras.component.html',
  styleUrls: ['./crear-empresas-distribuidoras.component.scss']
})
export class CrearEmpresasDistribuidorasComponent implements OnInit {
  // catálogos
  energeticos: Energetico[] = [];
  regiones: Localidad[] = [];
  comunasDisponibles: Localidad[] = [];

  // formulario (sin RUT; mismos campos que Editar excepto RUT)
  form: {
    Nombre: string;
    EnergeticoId: number | null;
    Active: boolean;
    RegionIds: number[];   // filtra comunas (multi)
    ComunaIds: number[];   // selección final (multi)
  } = {
    Nombre: '',
    EnergeticoId: null,
    Active: true,
    RegionIds: [],
    ComunaIds: []
  };

  // UI
  loading = true;
  saving = false;
  error = '';

  constructor(
    private service: EmpresasDistribuidorasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  // Carga energéticos + regiones
  private cargarCatalogos(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      energeticos: this.service.getEnergeticos().pipe(catchError(() => of([] as Energetico[]))),
      regiones: this.service.getRegiones().pipe(catchError(() => of([] as Localidad[])))
    }).subscribe({
      next: ({ energeticos, regiones }) => {
        this.energeticos = energeticos ?? [];
        this.regiones = regiones ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudieron cargar los catálogos.';
      }
    });
  }

  // Cargar comunas para N regiones, unidas en una sola lista
  private cargarComunasDe(regionIds: number[], replace = true, cb?: () => void): void {
    if (!regionIds?.length) {
      if (replace) this.comunasDisponibles = [];
      cb?.();
      return;
    }

    forkJoin(
      regionIds.map(id =>
        this.service.getComunasByRegionId(id).pipe(catchError(() => of([] as Localidad[])))
      )
    ).subscribe(listas => {
      const map = new Map<number, Localidad>();
      listas.flat().forEach(c => map.set(c.Id, c));
      const unidas = Array.from(map.values()).sort((a, b) => a.Nombre.localeCompare(b.Nombre));

      this.comunasDisponibles = replace
        ? unidas
        : Array.from(new Map([...this.comunasDisponibles, ...unidas].map(c => [c.Id, c])).values());

      // depura selecciones no válidas
      const validSet = new Set(this.comunasDisponibles.map(c => c.Id));
      this.form.ComunaIds = this.form.ComunaIds.filter(id => validSet.has(id));

      cb?.();
    });
  }

  onRegionsChange(): void {
    this.cargarComunasDe(this.form.RegionIds, true);
  }

  guardar(): void {
    this.error = '';

    if (!this.form.Nombre.trim()) {
      this.error = 'El nombre es obligatorio.';
      return;
    }
    if (!this.form.EnergeticoId) {
      this.error = 'Selecciona un energético.';
      return;
    }
    if (!this.form.ComunaIds?.length) {
      this.error = 'Selecciona al menos una comuna.';
      return;
    }

    const payload: CreateEmpresaPayload = {
      Nombre: this.form.Nombre.trim(),
      // RUT eliminado
      EnergeticoId: Number(this.form.EnergeticoId),
      ComunaIds: this.form.ComunaIds.map(Number)
    };

    this.saving = true;
    this.service.createEmpresa(payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/empresas-distribuidoras'], {
          state: { toast: { type: 'success', text: 'Empresa creada correctamente.' } }
        });
      },
      error: (err) => {
        console.error('[CrearEmpresaDistribuidora] error:', err);
        this.saving = false;
        this.error = 'No se pudo crear la empresa distribuidora.';
      }
    });
  }

  volver(): void {
    history.back();
  }
}
