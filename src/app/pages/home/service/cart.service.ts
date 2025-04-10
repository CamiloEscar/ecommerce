import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { URL_SERVICIOS } from '../../../config/config';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  public cart = new BehaviorSubject<Array<any>>([]); //necesitamos enviar datos a otros componentes, no tiene que ser solamente un observador
  public currentDataCart$ = this.cart.asObservable(); //observable que va a estar atento a todos los cambios de la variable cart


  constructor(
    public authService: AuthService,
    public http: HttpClient
  ) { }


  //componente de sincronizacion entre el proceso de agregar al carrito sin necesidad de recargar la pagina
  changeCart(DATA:any){
    let listCart = this.cart.getValue();
    let INDEX = listCart.findIndex((item:any) => item.id == DATA.id);
    if(INDEX != -1){
      listCart[INDEX] = DATA;
    } else {
      listCart.unshift(DATA);
    }
    this.cart.next(listCart);
  }

  resetCart(){
    let listCart:any = [];
    this.cart.next(listCart);
  }

  removeCart(DATA:any){
    let listCart = this.cart.getValue();
    let INDEX = listCart.findIndex((item:any) => item.id == DATA.id);
    if(INDEX != -1){
      listCart.splice(INDEX,1)
    }
    this.cart.next(listCart);
  }

  //FUNCIONES A NIVEL DE BACKEND

  listCart(){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/ecommerce/carts/";
    return this.http.get(URL, {headers: headers});
  }

  registerCart(data:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/ecommerce/carts";
    return this.http.post(URL, data, {headers: headers});
  }
  updateCart(cart_id:string, data:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/ecommerce/carts/"+cart_id;
    return this.http.put(URL, data, {headers: headers});
  }
  deleteCart(cart_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/ecommerce/carts/"+cart_id;
    return this.http.delete(URL, {headers: headers});
  }
}
