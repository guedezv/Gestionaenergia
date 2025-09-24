import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// layout
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FooterComponent } from '../../footer/footer.component';

// service
import {
  EmpresasDistribuidorasService,
  EmpresaDistribuidora,
  Energetico,
  Localidad,
  UpdateEmpresaPayload
} from '../../services/empresas-distribuidoras.service';

import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-editar-empresas-distribuidoras',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './editar-empresas-distribuidoras.component.html',
  styleUrls: ['./editar-empresas-distribuidoras.component.scss']
})
export class EditarEmpresasDistribuidorasComponent implements OnInit {
  id!: number | string;

  // catálogo
  energeticos: Energetico[] = [];
  regiones: Localidad[] = [];
  comunasDisponibles: Localidad[] = [];

  // formulario
  form: {
    Nombre: string;
    RUT?: string;
    EnergeticoId: number | null;
    Active: boolean;
    RegionIds: number[];   // para filtrar comunas
    ComunaIds: number[];
  } = {
    Nombre: '',
    RUT: '',
    EnergeticoId: null,
    Active: true,
    RegionIds: [],
    ComunaIds: []
  };

  loading = true;
  saving = false;
  error = '';

  constructor(
    private service: EmpresasDistribuidorasService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.cargarCatalogos().then(() => this.cargarEmpresa());
  }

  // Carga energéticos + regiones antes de la empresa
  private async cargarCatalogos(): Promise<void> {
    this.loading = true;
    this.error = '';
    await forkJoin({
      energeticos: this.service.getEnergeticos().pipe(catchError(() => of([]))),
      regiones: this.service.getRegiones().pipe(catchError(() => of([])))
    }).toPromise().then(({ energeticos, regiones }: any) => {
      this.energeticos = energeticos ?? [];
      this.regiones = regiones ?? [];
    });
  }

  private cargarEmpresa(): void {
    this.service.getEmpresaById(this.id).subscribe({
      next: (e: EmpresaDistribuidora) => {
        // Seed del formulario
        this.form.Nombre = e.Nombre ?? '';
        this.form.RUT = e.RUT ?? '';
        this.form.EnergeticoId = (e as any).EnergeticoId ?? null;
        this.form.Active = !!(e.Active ?? true);
        this.form.ComunaIds = [...(e as any).ComunaIds ?? []];

        // Para que el select de comunas muestre opciones, precargamos comunas
        // de todas las regiones, o bien puedes inferir RegionIds según convenga.
        const regionIds = this.regiones.map(r => r.Id);
        this.cargarComunasDe(regionIds, false, () => {
          // intenta calcular las regiones a partir de las comunas cargadas
          const regionByComuna = new Map<number, number>(); // comunaId -> regionId
          this.comunasDisponibles.forEach(c => {
            // este endpoint no entrega RegionId dentro de cada comuna, así que
            // lo dejamos sin inferir; si tu backend lo agrega, aquí podrías setearlo.
          });
          // opcionalmente deja todas las regiones seleccionadas:
          this.form.RegionIds = [];
          this.loading = false;
        });
      },
      error: (_err) => {
        this.loading = false;
        this.error = 'No se pudo cargar la empresa.';
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
      this.comunasDisponibles = replace ? unidas : Array.from(new Map([...this.comunasDisponibles, ...unidas].map(c => [c.Id, c])).values());
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
    if (!this.form.Nombre.trim() || !this.form.EnergeticoId || this.form.ComunaIds.length === 0) {
      this.error = 'Nombre, Energético y al menos una Comuna son obligatorios.';
      return;
    }
    this.saving = true;

    const payload: UpdateEmpresaPayload = {
      Nombre: this.form.Nombre.trim(),
      RUT: this.form.RUT?.trim() || undefined,
      EnergeticoId: Number(this.form.EnergeticoId),
      Active: !!this.form.Active,
      ComunaIds: this.form.ComunaIds.map(Number)
    };

    this.service.updateEmpresa(this.id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/empresas-distribuidoras'], {
          state: { toast: { type: 'success', text: 'Empresa actualizada correctamente.' } }
        });
      },
      error: (err) => {
        console.error('[EditarEmpresaDistribuidora] error:', err);
        this.saving = false;
        this.error =
          err?.status === 401 ? 'Sesión expirada. Vuelve a iniciar sesión.' :
          err?.status === 403 ? 'No tienes permisos para editar empresas.' :
          err?.status === 422 ? 'Datos inválidos. Revisa los campos.' :
          'No se pudo actualizar la empresa.';
      }
    });
  }

  volver(): void {
    history.back();
  }
}
