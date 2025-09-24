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
    { icono: '/icono-instituciones.svg', titulo: 'Instituciones', ruta: '/instituciones' },
    { icono: '/icono-servicios.svg', titulo: 'Servicios', ruta: '/servicios' },
    { icono: '/icono-inmuebles.svg', titulo: 'Inmuebles', ruta: '/inmuebles' },
    { icono: '/icono-unidades.svg', titulo: 'Unidades', ruta: '/unidades' },
    { icono: '/icono-usuarios.svg', titulo: 'Usuarios', ruta: '/usuarios' },
    { icono: '/icono-roles.svg', titulo: 'Roles', ruta: '/roles' },
    { icono: '/icono-unidades-energeticos.svg', titulo: 'Unidades Energéticos', ruta: '/unidades-energeticos' },
    { icono: '/icono-energeticos.svg', titulo: 'Energéticos', ruta: '/energeticos' },
    { icono: '/icono-empresas-distribuidoras.svg', titulo: 'Empresas Distribuidoras', ruta: '/empresas-distribuidoras' },
    { icono: '/icono-medidores.svg', titulo: 'Medidores', ruta: '/medidores' }
  ];
}
