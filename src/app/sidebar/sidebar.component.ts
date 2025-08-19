import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  menuItems = [
  {
    title: 'Unidades',
    route: '/home-unidades',
    icon: '/icono-sidebar-unidades.svg'
  },
  {
    title: 'Configuración',
    route: '/configuracion',
    icon: '/icono-sidebar-configuracion.svg'
  },
  {
    title: 'Opción',
    route: '#',
    icon: '/icono-sidebar-unidades.svg'
  },
  {
    title: 'Opción',
    route: '#',
    icon: '/icono-sidebar-unidades.svg'
  }
];
}
