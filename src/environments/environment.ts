export const environment = {
  production: false,           // true en prod.ts
  apiBase: '/api/v1',
  // Si tu backend exige client credentials, ponlos aquí:
  authClientId: '',            // p.ej. 'frontend' o el que te den
  authClientSecret: '',        // p.ej. 'super-secret'
  authScope: ''                // normalmente vacío
};
