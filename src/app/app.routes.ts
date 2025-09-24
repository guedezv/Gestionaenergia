// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Básicos
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  { path: 'home-unidades', loadComponent: () => import('./home-unidades/home-unidades.component').then(m => m.HomeUnidadesComponent) },
  { path: 'home-unidades/mi-unidad/:id', loadComponent: () => import('./home-unidades/mi-unidad/mi-unidad.component').then(m => m.MiUnidadComponent) },

  // Subvistas (nueva organización)
  {
    path: 'home-unidades/mi-unidad/:id/informacion-general',
    loadComponent: () =>
      import('./home-unidades/mi-unidad/informacion-general/mi-unidad-informacion-general.component')
        .then(m => m.MiUnidadInformacionGeneralComponent)
  },
  {
    path: 'home-unidades/mi-unidad/:id/energeticos',
    loadComponent: () =>
      import('./home-unidades/mi-unidad/energeticos/mi-unidad-energeticos.component')
        .then(m => m.MiUnidadEnergeticosComponent)
  },
  {
    path: 'home-unidades/mi-unidad/:id/sistemas',
    loadComponent: () =>
      import('./home-unidades/mi-unidad/sistemas/mi-unidad-sistemas.component')
        .then(m => m.MiUnidadSistemasComponent)
  },
  {
    path: 'home-unidades/mi-unidad/:id/actualizacion-datos-unidad',
    loadComponent: () =>
      import('./home-unidades/mi-unidad/actualizacion-datos-unidad/mi-unidad-actualizacion-datos-unidad.component')
        .then(m => m.MiUnidadActualizacionDatosUnidadComponent)
  },

  // (el resto de rutas tal cual las tenías)
  { path: 'configuracion', loadComponent: () => import('./configuracion/configuracion.component').then(m => m.ConfiguracionComponent) },
  { path: 'instituciones', loadComponent: () => import('./instituciones/instituciones.component').then(m => m.InstitucionesComponent) },
  { path: 'instituciones/crear', loadComponent: () => import('./instituciones/crear-institucion/crear-institucion.component').then(m => m.CrearInstitucionComponent) },
  {
    path: 'instituciones/editar/:id',
    loadComponent: () => import('./instituciones/editar-institucion/editar-institucion.component')
      .then(m => m.EditarInstitucionComponent)
  },
  { path: 'inmuebles', loadComponent: () => import('./inmuebles/inmuebles.component').then(m => m.InmueblesComponent) },
  { path: 'consumos', loadComponent: () => import('./consumos/consumos.component').then(m => m.ConsumosComponent) },
  { path: 'servicios', loadComponent: () => import('./servicios/servicios.component').then(m => m.ServiciosComponent) },
  { path: 'servicios/crear', loadComponent: () => import('./servicios/crear-servicio/crear-servicio.component').then(m => m.CrearServicioComponent) },
  { path: 'servicios/editar/:id', loadComponent: () => import('./servicios/editar-servicio/editar-servicio.component').then(m => m.EditarServicioComponent) },
  { path: 'unidades', loadComponent: () => import('./unidades/unidades.component').then(m => m.UnidadesComponent) },
  { path: 'usuarios', loadComponent: () => import('./usuarios/usuarios.component').then(m => m.UsuariosComponent) },
  { path: 'roles', loadComponent: () => import('./roles/roles.component').then(m => m.RolesComponent) },
  { path: 'roles/crear', loadComponent: () => import('./roles/crear-rol/crear-rol.component').then(m => m.CrearRolComponent) },
  { path: 'roles/crear/:id', loadComponent: () => import('./roles/crear-rol/crear-rol.component').then(m => m.CrearRolComponent) },
  { path: 'unidades-energeticos', loadComponent: () => import('./unidades-energeticos/unidades-energeticos.component').then(m => m.UnidadesEnergeticosComponent) },
  {
    path: 'unidades-energeticos/editar/:id',
    loadComponent: () => import('./unidades-energeticos/editar-unidades-energeticos/editar-unidades-energeticos.component')
      .then(m => m.EditarUnidadesEnergeticosComponent)
  },
  {
    path: 'unidades-energeticos/crear',
    loadComponent: () => import('./unidades-energeticos/crear-unidades-energeticos/crear-unidades-energeticos.component')
      .then(m => m.CrearUnidadesEnergeticosComponent)
  },
  { path: 'energeticos', loadComponent: () => import('./energeticos/energeticos.component').then(m => m.EnergeticosComponent) },
  {
    path: 'energeticos/editar/:id',
    loadComponent: () => import('./energeticos/editar-energeticos/editar-energeticos.component')
      .then(m => m.EditarEnergeticosComponent)
  },
  {
    path: 'energeticos/crear',
    loadComponent: () => import('./energeticos/crear-energeticos/crear-energeticos.component')
      .then(m => m.CrearEnergeticosComponent)
  },
  { path: 'empresas-distribuidoras', loadComponent: () => import('./empresas-distribuidoras/empresas-distribuidoras.component').then(m => m.EmpresasDistribuidorasComponent) },
  {
    path: 'empresas-distribuidoras/crear',
    loadComponent: () => import('./empresas-distribuidoras/crear-empresas-distribuidoras/crear-empresas-distribuidoras.component')
      .then(m => m.CrearEmpresasDistribuidorasComponent)
  },
  {
    path: 'empresas-distribuidoras/editar/:id',
    loadComponent: () => import('./empresas-distribuidoras/editar-empresas-distribuidoras/editar-empresas-distribuidoras.component')
      .then(m => m.EditarEmpresasDistribuidorasComponent)
  },
  { path: 'medidores', loadComponent: () => import('./medidores/medidores.component').then(m => m.MedidoresComponent) },
  {
    path: 'medidores/editar/:id',
    loadComponent: () => import('./medidores/editar-medidores/editar-medidores.component')
      .then(m => m.EditarMedidoresComponent)
  },
];
