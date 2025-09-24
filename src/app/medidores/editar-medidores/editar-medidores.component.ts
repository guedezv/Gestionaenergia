import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Layout
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FooterComponent } from '../../footer/footer.component';

// Services
import { MedidoresService, Medidor, DivisionMedidor } from '../../services/medidores.service';

@Component({
  selector: 'app-editar-medidores',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './editar-medidores.component.html',
  styleUrls: ['./editar-medidores.component.scss']
})
export class EditarMedidoresComponent implements OnInit {
  loading = true;
  saving = false;
  error = '';
  success = '';

  form = {
    Id: '' as number | string,
    Numero: '' as string,
    UnidadId: '' as string,
    NumeroCliente: '' as string,
    Active: true as boolean,
    DivisionId: null as number | string | null
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: MedidoresService
  ) {}

  ngOnInit(): void {
    this.cargarMedidor();
  }

  private cargarMedidor(): void {
    this.loading = true;
    this.error = '';
    const id = this.route.snapshot.paramMap.get('id') || '';

    this.service.getById(id).subscribe({
      next: (m: Medidor) => {
        this.form = {
          Id: m.Id,
          Numero: String(m.Numero ?? ''),
          UnidadId: String(m.UnidadId ?? ''),
          NumeroCliente: String(m.NumeroCliente ?? ''),
          Active: !!(m.Active ?? (m as any)['Activo']),
          DivisionId: (m.DivisionId ?? (m as any)['ServicioId'] ?? null) as any
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('[EditarMedidores] getById error', err);
        this.error = 'No se pudo cargar el medidor.';
        this.loading = false;
      }
    });
  }

  guardar(): void {
    this.error = '';
    this.success = '';

    const divisionId = this.form.DivisionId;
    const medidorId = this.form.Id;

    if (!divisionId) { this.error = 'Este medidor no tiene División asociada (DivisionId).'; return; }
    if (!medidorId)  { this.error = 'ID de medidor inválido.'; return; }

    this.saving = true;

    this.service.getDivisionSet(divisionId).subscribe({
      next: (setActual: DivisionMedidor[]) => {
        const idsActuales = Array.from(
          new Set(
            (setActual ?? [])
              .map((x: any) => {
                const val =
                  x?.['MedidorId'] ??
                  x?.['Medidor']?.['Id'] ??
                  x?.['Medidor']?.['ID'] ??
                  x?.['Id'];
                const n = Number(val);
                return Number.isFinite(n) ? n : NaN;
              })
              .filter((n: number) => Number.isFinite(n))
          )
        );

        const idNum = Number(medidorId);
        if (Number.isFinite(idNum) && !idsActuales.includes(idNum)) {
          idsActuales.push(idNum);
        }

        this.service.replaceDivisionSet(divisionId, idsActuales).subscribe({
          next: () => {
            this.saving = false;
            this.success = 'Cambios guardados correctamente.';
          },
          error: (err) => {
            console.error('[EditarMedidores] replaceDivisionSet error', err);
            this.error = (err?.status === 401)
              ? 'No autenticado. Inicia sesión nuevamente.'
              : 'No se pudieron guardar los cambios.';
            this.saving = false;
          }
        });
      },
      error: (err) => {
        console.error('[EditarMedidores] getDivisionSet error', err);
        this.error = (err?.status === 401)
          ? 'No autenticado. Inicia sesión nuevamente.'
          : 'No se pudo obtener el set actual de la división.';
        this.saving = false;
      }
    });
  }

  volver(): void { this.router.navigate(['/medidores']); }
}
