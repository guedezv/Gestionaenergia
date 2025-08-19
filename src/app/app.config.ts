// app.config.ts

import { ApplicationConfig, importProvidersFrom } from '@angular/core'; // Añade 'importProvidersFrom'
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Importa FormsModule

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(FormsModule) // Añade esto
  ]
};