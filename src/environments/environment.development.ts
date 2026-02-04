// export const environment = {
//   URL_BACKEND: 'http://127.0.0.1:8000/',
//   URL_SERVICIOS: 'http://127.0.0.1:8000/api',
//   URL_FRONTEND: 'http://localhost:4200',
//   production: false,
// };


//cambio los puertos para que ande en produccion con ngrok y railway, de ese modo puedo testear mercado pago
export const environment = {
  URL_BACKEND: 'https://apiecommerce-production-9896.up.railway.app/',
  URL_SERVICIOS: 'https://apiecommerce-production-9896.up.railway.app/api',
  URL_FRONTEND: 'http://localhost:4200',
  production: false,
};
