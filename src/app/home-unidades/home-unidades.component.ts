// src/app/home-unidades/home-unidades.component.ts
import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
// ⬇️ Quitados: MatFormFieldModule, MatInputModule

import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

import { debounceTime, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { HomeUnidadesService, Direccion, DireccionListResp } from '../services/home-unidades.service';
import { Router } from '@angular/router';

type Unidad = { id: number; nombre: string };

@Component({
  selector: 'app-home-unidades',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // ⬇️ Quitados módulos de Angular Material para el input
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './home-unidades.component.html',
  styleUrls: ['./home-unidades.component.scss']
})
export class HomeUnidadesComponent {
  filtroCtrl = new FormControl('', { nonNullable: true });

  pageSize = 10;
  pageIndex = signal(0);
  totalPages = signal(1);
  totalCount = signal(0);

  private _unidades = signal<Unidad[]>([]);
  /** para el template */
  paginaActual = () => this._unidades();

  constructor(
    private homeSrv: HomeUnidadesService,
    private router: Router
  ) {
    
    // filtro reactivo → recarga desde API y resetea a página 0
    toSignal(
      this.filtroCtrl.valueChanges.pipe(startWith(this.filtroCtrl.value), debounceTime(250)),
      { initialValue: '' }
    );

    this.loadPage(0);

    // cuando cambia el filtro, ir a la primera página
    this.filtroCtrl.valueChanges.pipe(debounceTime(250)).subscribe(() => this.loadPage(0));
  }

  private loadPage(index: number, search?: string) {
    const page1 = index + 1;
    this.homeSrv
      .getDirecciones({ page: page1, page_size: this.pageSize, search: search ?? this.filtroCtrl.value })
      .subscribe({
        next: (resp: DireccionListResp) => {
          this._unidades.set(
            (resp.items || []).map((d: Direccion) => ({
              id: d.Id,
              nombre: d.DireccionCompleta || `${d.Calle} ${d.Numero}`
            }))
          );
          this.pageIndex.set(resp.page - 1);
          this.pageSize = resp.pageSize;
          this.totalCount.set(resp.total);
          this.totalPages.set(Math.max(1, resp.totalPages));
        },
        error: (err: unknown) => {
          console.error('[HomeUnidades] error listando direcciones:', err);
          this._unidades.set([]);
          this.pageIndex.set(0);
          this.totalCount.set(0);
          this.totalPages.set(1);
        }
      });
  }

  // Controles de paginación
  goToPage(i: number) { this.loadPage(i); }
  prev() { this.goToPage(Math.max(this.pageIndex() - 1, 0)); }
  next() { this.goToPage(Math.min(this.pageIndex() + 1, this.totalPages() - 1)); }
  first() { this.goToPage(0); }
  last() { this.goToPage(this.totalPages() - 1); }

  // Navegar al detalle
  openUnidad(id: number) { this.router.navigate(['/home-unidades/mi-unidad', id]); }
}
