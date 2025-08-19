// src/app/instituciones/instituciones.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-empresas-distribuidoras',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, SidebarComponent],
  templateUrl: './empresas-distribuidoras.component.html',
  styleUrls: ['./empresas-distribuidoras.component.scss']
})
export class EmpresasDistribuidorasComponent { }
