import { HttpClient } from '@angular/common/http';
import { afterNextRender, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { URL_SERVICIOS } from '../../../config/config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  token: string = '';
  user: any;

  constructor(public http: HttpClient, public router: Router) {
    afterNextRender(() => {
      this.initAuth();
    });
  }

  initAuth() {
    if (localStorage.getItem('token')) {
      this.user = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') ?? '')
        : null;
      this.token = localStorage.getItem('token') || '';
    }
  }

  // Centralizamos el guardado de sesión
  saveLocalStorage(resp: any) {
    if (resp && resp.access_token) {
      localStorage.setItem('token', resp.access_token);
      localStorage.setItem('user', JSON.stringify(resp.user));
      this.token = resp.access_token; // Actualización inmediata
      this.user = resp.user;          // Actualización inmediata
      return true;
    }
    return false;
  }

  login(email: string, password: string) {
    let URL = URL_SERVICIOS + '/auth/login_ecommerce';
    return this.http.post(URL, { email, password }).pipe(
      map((resp: any) => this.saveLocalStorage(resp)),
      catchError((err: any) => of(err))
    );
  }

  register(data: any) {
    let URL = URL_SERVICIOS + '/auth/register';
    return this.http.post(URL, data);
  }

  loginWithGoogle(googleToken: string) {
    let URL = URL_SERVICIOS + '/auth/social/google';
    return this.http.post(URL, { access_token: googleToken }).pipe(
      map((resp: any) => this.saveLocalStorage(resp)),
      catchError((err) => {
        console.error('Error en el login con Google', err);
        return of(false);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token = '';
    this.user = null;
    this.router.navigateByUrl('/login');
  }

  // Métodos de verificación (mantener si se usan)
  verifiedAuth(data: any) {
    return this.http.post(URL_SERVICIOS + '/auth/verified_auth', data);
  }

 
  verifiedMail(data: any) {
    let URL = URL_SERVICIOS + '/auth/verified_email';
    return this.http.post(URL, data);
  }

  verifiedCode(data: any) {
    let URL = URL_SERVICIOS + '/auth/verified_code';
    return this.http.post(URL, data);
  }

  verifiedNewPassword(data: any) {
    let URL = URL_SERVICIOS + '/auth/new_password';
    return this.http.post(URL, data);
  }
}