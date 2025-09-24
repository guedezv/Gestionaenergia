import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { HeaderComponent } from '../../../header/header.component';
import { SidebarComponent } from '../../../sidebar/sidebar.component';
import { FooterComponent } from '../../../footer/footer.component';

@Component({
  selector: 'app-mi-unidad-actualizacion-datos-unidad',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './mi-unidad-actualizacion-datos-unidad.component.html',
  styleUrls: ['./mi-unidad-actualizacion-datos-unidad.component.scss']
})
export class MiUnidadActualizacionDatosUnidadComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  id = Number(this.route.snapshot.paramMap.get('id') ?? 0);

  go(tab: 'informacion-general' | 'energeticos' | 'sistemas' | 'actualizacion-datos-unidad') {
    this.router.navigate([`/home-unidades/mi-unidad/${this.id}/${tab}`]);
  }
}
