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
  this.loginError = false;

  this.authService.login(this.credentials).subscribe({
    next: (res) => {
      // 1) token del swagger
      const token = res?.access_token;
      if (token) localStorage.setItem('access_token', token);

      // 2) user_id preferente desde la respuesta
      let userId: string | null | undefined = res?.user?.id;

      // 3) fallback: decodificar el JWT si no vino el user.id
      if (!userId && token) {
        const parseJwt = (t: string) => {
          try {
            const base64 = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const json = atob(base64);
            return JSON.parse(
              decodeURIComponent(
                Array.prototype.map
                  .call(json, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              )
            );
          } catch {
            return null;
          }
        };
        const payload = parseJwt(token);
        userId = payload?.user_id ?? payload?.uid ?? payload?.sub ?? payload?.id ?? null;
      }

      if (userId != null) {
        localStorage.setItem('user_id', String(userId));
      }

      this.router.navigate(['/home-unidades']);
    },
    error: (err) => {
      console.error('Error en el login', err);
      this.loginError = true;
      // opcional: mostrar err?.error?.detail en la UI
    }
  });
}

}