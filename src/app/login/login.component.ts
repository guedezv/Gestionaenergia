// Importa las clases necesarias de Angular
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importa Router para la redirección

// Importa los módulos de Angular Material
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

// Importa el servicio de autenticación que creaste
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // Objeto para almacenar las credenciales que el usuario introduce
  credentials = {
    username: '',
    password: ''
  };
  
  // Variable para mostrar mensajes de error en la vista
  loginError = false;

  // Inyecta el servicio de autenticación y el Router en el constructor
  constructor(private authService: AuthService, private router: Router) { }

  // Método que se ejecuta cuando el usuario hace clic en el botón de login
  onLoginSubmit(): void {
    console.log('Botón de Ingresar clickeado'); // Agrega esta línea
    console.log('Credenciales:', this.credentials);
    // Restablece el error antes de un nuevo intento
    this.loginError = false;
    
    // Llama al método 'login' de nuestro servicio
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);

        // Guarda el token de acceso que devuelve el backend
        localStorage.setItem('access_token', response.access_token);
        
        // **IMPORTANTE**: La ruta '/dashboard' debe existir en tu configuración de rutas de Angular
        this.router.navigate(['/home-unidades']); 
      },
      error: (error) => {
        console.error('Error en el login', error);
        
        // Si hay un error, actualiza la variable para mostrar el mensaje de error en la vista
        this.loginError = true;
      }
    });
  }
}