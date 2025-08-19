import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home-unidades',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCheckboxModule, SidebarComponent, HeaderComponent, FooterComponent],
  templateUrl: './home-unidades.component.html',
  styleUrls: ['./home-unidades.component.scss']
})
export class HomeUnidadesComponent {
  unidades = [
    { nombre: 'Unidad 1', activa: true },
    { nombre: 'Unidad 2', activa: false },
    { nombre: 'Unidad 3', activa: true }
  ];
}
