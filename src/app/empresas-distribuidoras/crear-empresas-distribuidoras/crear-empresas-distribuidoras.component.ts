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

@Component({
  selector: 'app-crear-empresas-distribuidoras',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './crear-empresas-distribuidoras.component.html',
  styleUrls: ['./crear-empresas-distribuidoras.component.scss']
})
export class CrearEmpresasDistribuidorasComponent implements OnInit {
  // form
  nombre = '';
  rut = '';
  energeticoId: number | null = null;
  regionId: number | null = null;
  comunaIds: number[] = []; // <select multiple> se bindea a este array

  // catálogos
  energeticos: Energetico[] = [];
  regiones: Localidad[] = [];
  comunas: Localidad[] = []; // comunas disponibles según región

  // UI
  loading = true;
  saving = false;
  error = '';

  constructor(
    private service: EmpresasDistribuidorasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = '';

    // Cargar catálogos en paralelo
    Promise.all([
      this.service.getEnergeticos().toPromise(),
      this.service.getRegiones().toPromise()
    ])
      .then(([energeticos, regiones]) => {
        this.energeticos = energeticos ?? [];
        this.regiones = regiones ?? [];
        this.loading = false;
      })
      .catch((_err) => {
        this.loading = false;
        this.error = 'No se pudieron cargar los catálogos.';
      });
  }

  onRegionChange(): void {
    this.comunaIds = [];
    this.comunas = [];
    if (!this.regionId) return;

    this.service.getComunasByRegionId(this.regionId).subscribe({
      next: (comunas) => (this.comunas = comunas ?? []),
      error: () => (this.error = 'No se pudieron cargar las comunas.')
    });
  }

  guardar(): void {
    this.error = '';
    if (!this.nombre.trim()) {
      this.error = 'El nombre es obligatorio.';
      return;
    }
    if (!this.energeticoId) {
      this.error = 'Selecciona un energético.';
      return;
    }
    if (!this.comunaIds?.length) {
      this.error = 'Selecciona al menos una comuna.';
      return;
    }

    const payload: CreateEmpresaPayload = {
      Nombre: this.nombre.trim(),
      RUT: this.rut?.trim() || undefined,
      EnergeticoId: this.energeticoId,
      ComunaIds: this.comunaIds
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
