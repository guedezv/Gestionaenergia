// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

// (Opcional) Solo necesitas FormsModule aquí si de verdad lo usas globalmente.
// Para componentes standalone normalmente no hace falta, pero lo dejo como lo tenías.
import { FormsModule } from '@angular/forms';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor]) // 👈 registra el interceptor que añade el Bearer token
    ),
    importProvidersFrom(FormsModule)
  ]
};
