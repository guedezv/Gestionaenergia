import { Routes } from '@angular/router';

export const routes: Routes = [
  // Redirige la ruta principal a 'login'
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Carga perezosa de los componentes.
  // Es la forma recomendada de trabajar con componentes standalone.
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  { path: 'home-unidades', loadComponent: () => import('./home-unidades/home-unidades.component').then(m => m.HomeUnidadesComponent) },
  { path: 'configuracion', loadComponent: () => import('./configuracion/configuracion.component').then(m => m.ConfiguracionComponent) },
  { path: 'instituciones', loadComponent: () => import('./instituciones/instituciones.component').then(m => m.InstitucionesComponent) },
  { path: 'inmuebles', loadComponent: () => import('./inmuebles/inmuebles.component').then(m => m.InmueblesComponent) },
  { path: 'servicios', loadComponent: () => import('./servicios/servicios.component').then(m => m.ServiciosComponent) },
  { path: 'unidades', loadComponent: () => import('./unidades/unidades.component').then(m => m.UnidadesComponent) },
  { path: 'usuarios', loadComponent: () => import('./usuarios/usuarios.component').then(m => m.UsuariosComponent) },
  { path: 'roles', loadComponent: () => import('./roles/roles.component').then(m => m.RolesComponent) },
  { path: 'unidades-energeticos', loadComponent: () => import('./unidades-energeticos/unidades-energeticos.component').then(m => m.UnidadesEnergeticosComponent) },
  { path: 'energeticos', loadComponent: () => import('./energeticos/energeticos.component').then(m => m.EnergeticosComponent) },
  { path: 'empresas-distribuidoras', loadComponent: () => import('./empresas-distribuidoras/empresas-distribuidoras.component').then(m => m.EmpresasDistribuidorasComponent) },
  { path: 'medidores', loadComponent: () => import('./medidores/medidores.component').then(m => m.MedidoresComponent) }
];