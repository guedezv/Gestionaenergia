import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';

import { HeaderComponent } from '../../../header/header.component';
import { SidebarComponent } from '../../../sidebar/sidebar.component';
import { FooterComponent } from '../../../footer/footer.component';
import { BreadcrumbComponent } from '../../../shared/breadcrumb/breadcrumb.component';
import { MiUnidadInformacionGeneralService } from '../../../services/mi-unidad-informacion-general.service';
@Component({
  selector: 'app-mi-unidad-actualizacion-datos-unidad',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, SidebarComponent, FooterComponent,BreadcrumbComponent,RouterLinkActive],
  templateUrl: './mi-unidad-actualizacion-datos-unidad.component.html',
  styleUrls: ['./mi-unidad-actualizacion-datos-unidad.component.scss']
})
export class MiUnidadActualizacionDatosUnidadComponent {
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
