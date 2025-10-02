import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';

// Layout
import { HeaderComponent } from '../../../header/header.component';
import { SidebarComponent } from '../../../sidebar/sidebar.component';
import { FooterComponent } from '../../../footer/footer.component';

// Service
import {
  MiUnidadEnergeticosService,
  Energetico
} from '../../../services/mi-unidad-energeticos.service';
import { BreadcrumbComponent } from '../../../shared/breadcrumb/breadcrumb.component';
import { MiUnidadInformacionGeneralService } from '../../../services/mi-unidad-informacion-general.service';

@Component({
  selector: 'app-mi-unidad-energeticos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    BreadcrumbComponent
  ],
  templateUrl: './mi-unidad-energeticos.component.html',
  styleUrls: ['./mi-unidad-energeticos.component.scss']
})
export class MiUnidadEnergeticosComponent implements OnInit {
  divisionId = 0;
  id = 0; // 👈 declaramos, pero la llenamos en ngOnInit()

  // Filtro (texto libre por nombre)
  q = '';
  private infoSrv = inject(MiUnidadInformacionGeneralService);
    direccion = {
    Calle: '—', Numero: '—', RegionId: 0, ProvinciaId: 0, ComunaId: 0, DireccionCompleta: ''
  };
  // Señales para manejar datos y paginación client-side (el endpoint no pagina)
  private _all = signal<Energetico[]>([]);
  pageSize = signal<number>(10);
  page = signal<number>(1);
  loading = signal<boolean>(false);

  filtrados = computed(() => {
    const term = (this.q || '').trim().toLowerCase();
    let list = this._all()
      .slice()
      .sort((a, b) => {
        const pa = a?.Posicion ?? 9999;
        const pb = b?.Posicion ?? 9999;
        if (pa !== pb) return pa - pb;
        return (a?.Nombre || '').localeCompare(b?.Nombre || '');
      });

    if (term) {
      list = list.filter(e => (e.Nombre || '').toLowerCase().includes(term));
    }
    return list;
  });

  total = computed(() => this.filtrados().length);
  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  energeticosPaginados = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filtrados().slice(start, start + this.pageSize());
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private srv: MiUnidadEnergeticosService
  ) {

  }

  ngOnInit(): void {
    // ✅ aquí ya puedes usar this.route
    this.divisionId = Number(this.route.snapshot.paramMap.get('id') ?? 0);
    this.id = this.divisionId; // o usar otro param si es distinto

    this.cargar();
        if (this.id > 0) {
      this.infoSrv.getDireccionById(this.id).subscribe({
        next: d => this.direccion = d,
        error: e => console.error('[InformacionGeneral] error:', e)
      });
    }
  }

  go(tab: 'informacion-general' | 'energeticos' | 'sistemas' | 'actualizacion-datos-unidad') {
    this.router.navigate([`/home-unidades/mi-unidad/${this.id}/${tab}`]);
  }

  cargar(): void {
    if (!this.divisionId) return;
    this.loading.set(true);
    this.srv.getEnergeticosActivosByDivision(this.divisionId).subscribe({
      next: (list) => {
        this._all.set(list ?? []);
        // resetea paginación cuando llega data
        this.page.set(1);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('[Energeticos activos/division] error:', err);
        this._all.set([]);
        this.page.set(1);
        this.loading.set(false);
      }
    });
  }

  aplicarFiltro(): void {
    this.page.set(1);
    // no se llama al backend: filtro client-side
  }

  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPages()) {
      this.page.set(p);
    }
  }

  volver(): void {
    if (this.divisionId) this.router.navigate(['/home-unidades/mi-unidad', this.divisionId]);
    else this.router.navigate(['/home-unidades']);
  }

  toggleAria(e: Energetico) {
    return e.Active ? 'Activo' : 'Inactivo';
  }
    fontSize = 100; // porcentaje
  contrasteAlto = false;

  aumentarTexto() {
    if (this.fontSize < 150) {
      this.fontSize += 10;
      document.documentElement.style.fontSize = `${this.fontSize}%`;
    }
  }

  disminuirTexto() {
    if (this.fontSize > 70) {
      this.fontSize -= 10;
      document.documentElement.style.fontSize = `${this.fontSize}%`;
    }
  }

  toggleContraste() {
    this.contrasteAlto = !this.contrasteAlto;
    document.body.classList.toggle('alto-contraste', this.contrasteAlto);
  }
}

