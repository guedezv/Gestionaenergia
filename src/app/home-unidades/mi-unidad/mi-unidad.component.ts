import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Layout
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FooterComponent } from '../../footer/footer.component';

@Component({
  selector: 'app-mi-unidad',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './mi-unidad.component.html',
  styleUrls: ['./mi-unidad.component.scss']
})
export class MiUnidadComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  id = Number(this.route.snapshot.paramMap.get('id') ?? 0);

  go(tab: 'informacion-general' | 'energeticos' | 'sistemas' | 'actualizacion-datos-unidad') {
    this.router.navigate([`/home-unidades/mi-unidad/${this.id}/${tab}`]);
  }
}
