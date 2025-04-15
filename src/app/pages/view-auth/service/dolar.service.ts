import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class DolarService {
  private apiUrl = environment.URL_SERVICIOS;

  constructor(private http: HttpClient) {}

  obtenerDolar() {
    return this.http.get<any>(`${this.apiUrl}/ecommerce/dolar`);
  }
}
