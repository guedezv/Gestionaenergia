export const environment = {
  production: true,           // true en prod.ts
  apiBase: '/api/v1', // Ajustar de acuerdo al IP o Dominio de la instancia donde se valla a alojar el backend ejemplo: "https://midominio.cl/api/v1"
  // Si tu backend exige client credentials, ponlos aquí:
  authClientId: '',            // p.ej. 'frontend' o el que te den
  authClientSecret: '',        // p.ej. 'super-secret'
  authScope: ''                // normalmente vacío
};
