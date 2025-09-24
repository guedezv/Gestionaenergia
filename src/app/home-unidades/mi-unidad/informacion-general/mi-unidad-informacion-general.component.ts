import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// Layout
import { HeaderComponent } from '../../../header/header.component';
import { SidebarComponent } from '../../../sidebar/sidebar.component';
import { FooterComponent } from '../../../footer/footer.component';

// Servicio
import { MiUnidadInformacionGeneralService } from '../../../services/mi-unidad-informacion-general.service';

@Component({
  selector: 'app-mi-unidad-informacion-general',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './mi-unidad-informacion-general.component.html',
  styleUrls: ['./mi-unidad-informacion-general.component.scss']
})
export class MiUnidadInformacionGeneralComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private infoSrv = inject(MiUnidadInformacionGeneralService);

  id = Number(this.route.snapshot.paramMap.get('id') ?? 0);

  direccion = {
    Calle: '—', Numero: '—', RegionId: 0, ProvinciaId: 0, ComunaId: 0, DireccionCompleta: ''
  };

  constructor() {
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
}
