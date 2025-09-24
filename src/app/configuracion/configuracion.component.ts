import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, SidebarComponent],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent {
  opciones = [
    { icono: '/icono-instituciones.svg', iconoHover: '/icono-instituciones-hover.svg', titulo: 'Instituciones', ruta: '/instituciones', isHovered: false },
    { icono: '/icono-servicios.svg', iconoHover: '/icono-servicios-hover.svg', titulo: 'Servicios', ruta: '/servicios', isHovered: false },
    { icono: '/icono-inmuebles.svg', iconoHover: '/icono-inmuebles-hover.svg', titulo: 'Inmuebles', ruta: '/inmuebles', isHovered: false },
    { icono: '/icono-unidades.svg', iconoHover: '/icono-unidades-hover.svg', titulo: 'Unidades', ruta: '/unidades', isHovered: false },
    { icono: '/icono-usuarios.svg', iconoHover: '/icono-usuarios-hover.svg', titulo: 'Usuarios', ruta: '/usuarios', isHovered: false },
    { icono: '/icono-roles.svg', iconoHover: '/icono-roles-hover.svg', titulo: 'Roles', ruta: '/roles', isHovered: false },
    { icono: '/icono-unidades-energeticos.svg', iconoHover: '/icono-unidades-energeticos-hover.svg', titulo: 'Unidades Energéticos', ruta: '/unidades-energeticos', isHovered: false },
    { icono: '/icono-energeticos.svg', iconoHover: '/icono-energeticos-hover.svg', titulo: 'Energéticos', ruta: '/energeticos', isHovered: false },
    { icono: '/icono-empresas-distribuidoras.svg', iconoHover: '/icono-empresas-distribuidoras-hover.svg', titulo: 'Empresas Distribuidoras', ruta: '/empresas-distribuidoras', isHovered: false },
    { icono: '/icono-medidores.svg', iconoHover: '/icono-medidores-hover.svg', titulo: 'Medidores', ruta: '/medidores', isHovered: false },
    { icono: '/icono-consumos.svg', iconoHover: '/icono-consumos-hover.svg', titulo: 'Consumos', ruta: '/consumos', isHovered: false }
  ];
}