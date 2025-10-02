// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // 👈 IMPORTAR ESTO
import { BreadcrumbComponent } from './shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    
    HttpClientModule,  // 👈 AÑADIR AQUÍ
    BreadcrumbComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'tu-app';
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
