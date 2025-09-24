import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Layout
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FooterComponent } from '../../footer/footer.component';

// Service
import { EnergeticosService, Energetico } from '../../services/energeticos.service';

type UpdateEnergeticoPayload = {
  Nombre: string;
  Icono: string;
  Multiple: boolean;
  PermiteMedidor: boolean;
  Posicion: number;
  PermitePotenciaSuministrada: boolean;
  PermiteTipoTarifa: boolean;
  Active: boolean;
};

@Component({
  selector: 'app-editar-energeticos',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './editar-energeticos.component.html',
  styleUrls: ['./editar-energeticos.component.scss']
})
export class EditarEnergeticosComponent implements OnInit {
  id!: number | string;

  form: UpdateEnergeticoPayload = {
    Nombre: '',
    Icono: '',
    Multiple: false,
    PermiteMedidor: false,
    Posicion: 0,
    PermitePotenciaSuministrada: false,
    PermiteTipoTarifa: false,
    Active: true
  };

  iconFileName = '';   // solo visual

  loading = true;
  saving  = false;
  error   = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private energeticosService: EnergeticosService
  ) {}

  ngOnInit(): void {
    // id desde /energeticos/editar/:id o desde state
    this.id = this.route.snapshot.paramMap.get('id')!;
    const st: any = history.state;
    if (st?.energetico?.Id) this.id = st.energetico.Id;

    this.cargar();
  }

  private cargar(): void {
    this.loading = true;
    this.error = '';

this.energeticosService.getEnergeticoById(this.id).subscribe({
      next: (e: Energetico) => {
        this.form = {
          Nombre: e?.Nombre ?? '',
          Icono:  e?.Icono  ?? '',
          Multiple: !!e?.Multiple,
          PermiteMedidor: !!e?.PermiteMedidor,
          Posicion: Number.isFinite(Number(e?.Posicion)) ? Number(e?.Posicion) : 0,
          PermitePotenciaSuministrada: !!e?.PermitePotenciaSuministrada,
          PermiteTipoTarifa: !!e?.PermiteTipoTarifa,
          Active: !!(e?.Active ?? true)
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo cargar el energético.';
      }
    });
  }

  onFilePicked(ev: Event): void {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.iconFileName = file.name;
    // Si luego tienes endpoint de subida, aquí lo implementas.
    // Por ahora solo mostramos el nombre y mantienes el campo Icono como texto.
  }

  guardar(): void {
    if (this.saving) return;
    this.error = '';

    // El swagger espera Posicion como número
    const pos = Number(this.form.Posicion);
    const payload: UpdateEnergeticoPayload = {
      ...this.form,
      Posicion: Number.isFinite(pos) ? pos : 0
    };

    this.saving = true;
    this.energeticosService.updateEnergetico(this.id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/energeticos'], {
          state: { toast: { type: 'success', text: 'Energético actualizado correctamente.' } }
        });
      },
      error: () => {
        this.saving = false;
        this.error = 'No se pudo guardar el energético.';
      }
    });
  }

  volver(): void {
    history.back();
  }
}
