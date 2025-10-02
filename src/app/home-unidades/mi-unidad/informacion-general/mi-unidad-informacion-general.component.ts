import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';

// Layout
import { HeaderComponent } from '../../../header/header.component';
import { SidebarComponent } from '../../../sidebar/sidebar.component';
import { FooterComponent } from '../../../footer/footer.component';

// Servicio
import { MiUnidadInformacionGeneralService } from '../../../services/mi-unidad-informacion-general.service';
import { BreadcrumbComponent } from '../../../shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-mi-unidad-informacion-general',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, SidebarComponent, FooterComponent,BreadcrumbComponent,RouterLinkActive],
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
    console.log('[INFO GENERAL] ID capturado desde la ruta:', this.id);

    if (this.id > 0) {
      console.log('[INFO GENERAL] Consultando dirección al backend…');
      this.infoSrv.getDireccionById(this.id).subscribe({
        next: d => {
          console.log('[INFO GENERAL] Respuesta recibida desde backend:', d);
          this.direccion = d;
        },
        error: e => {
          console.error('[INFO GENERAL] ❌ Error al cargar dirección:', e);
        }
      });
    } else {
      console.warn('[INFO GENERAL] ⚠️ ID inválido o no presente en ruta.');
    }
  }

  go(tab: 'informacion-general' | 'energeticos' | 'sistemas' | 'actualizacion-datos-unidad') {
    console.log(`[NAV] Ir a pestaña: ${tab}`);
    this.router.navigate([`/home-unidades/mi-unidad/${this.id}/${tab}`]);
  }

  fontSize = 100; // porcentaje
  contrasteAlto = false;

  aumentarTexto() {
    if (this.fontSize < 150) {
      this.fontSize += 10;
      document.documentElement.style.fontSize = `${this.fontSize}%`;
      console.log(`[ACCESIBILIDAD] Tamaño aumentado a ${this.fontSize}%`);
    }
  }

  disminuirTexto() {
    if (this.fontSize > 70) {
      this.fontSize -= 10;
      document.documentElement.style.fontSize = `${this.fontSize}%`;
      console.log(`[ACCESIBILIDAD] Tamaño reducido a ${this.fontSize}%`);
    }
  }

  toggleContraste() {
    this.contrasteAlto = !this.contrasteAlto;
    document.body.classList.toggle('alto-contraste', this.contrasteAlto);
    console.log(`[ACCESIBILIDAD] Contraste alto: ${this.contrasteAlto}`);
  }
}

