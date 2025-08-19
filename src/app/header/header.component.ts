import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth.service'; // Importa el AuthService

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  
  // Inyecta el AuthService en el constructor
  constructor(private authService: AuthService) { }

  /**
   * Este método se llama desde el HTML cuando se hace clic en el botón de salir.
   */
  onLogout(): void {
    this.authService.logout();
  }
}