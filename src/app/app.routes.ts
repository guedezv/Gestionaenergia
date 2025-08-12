import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // opcional
  { path: 'login', component: LoginComponent },
  // { path: '', redirectTo: 'login' } // opcional
];