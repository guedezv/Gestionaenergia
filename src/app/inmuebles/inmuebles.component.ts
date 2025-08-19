// src/app/inmuebles/inmuebles.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-inmuebles',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, SidebarComponent],
  templateUrl: './inmuebles.component.html',
  styleUrls: ['./inmuebles.component.scss']
})
export class InmueblesComponent { }
