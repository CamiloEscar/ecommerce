import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PRODUCTION, URL_SERVICIOS } from '../../../config/config';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  public cart = new BehaviorSubject<Array<any>>([]); //necesitamos enviar datos a otros componentes, no tiene que ser solamente un observador
  public currentDataCart$ = this.cart.asObservable(); //observable que va a estar atento a todos los cambios de la variable cart
  // costo de envio mantenido en el servicio para que sobreviva a recargas del carrito
  public shippingCost: number | null = null;


  constructor(
    public authService: AuthService,
    public http: HttpClient
  ) { }

// ===== changeCart: COPIA del array =====
changeCart(DATA: any) {
    let listCart = [...this.cart.getValue()];
    let INDEX = listCart.findIndex((item: any) => item.id == DATA.id);
    if (INDEX != -1) {
      listCart[INDEX] = { ...DATA };
    } else {
      listCart.unshift({ ...DATA });
    }
    this.cart.next(listCart);
}

// ===== setShipping: Solo guardar el valor, NO agregar item al BehaviorSubject =====
setShipping(cost: number | null) {
    this.shippingCost = cost;
}

// ===== setCart: Deep copy =====
setCart(list: any[]) {
    this.cart.next(list.map((item: any) => ({ ...item })));
}

// ===== removeCart: COPIA (filter crea nuevo array) =====
removeCart(DATA: any) {
    let listCart = this.cart.getValue().filter((item: any) => item.id != DATA.id);
    this.cart.next(listCart);
}

// ===== resetCart =====
resetCart() {
    this.cart.next([]);
    // NO limpiar shippingCost aqui, se maneja aparte
}
clearCart(){
  this.cart.next([]);
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
  deleteCartsAll(){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/ecommerce/carts/delete_all";  // This is now correct with the underscore
    return this.http.delete(URL, {headers: headers});
  }
  applyCupon(data:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/ecommerce/carts/apply_cupon";
    return this.http.post(URL, data, {headers: headers});
  }
  applyCosto(data:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/ecommerce/carts/apply_costo";
    return this.http.post(URL, data, {headers: headers});
  }
  removeCosto(){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/ecommerce/carts/remove_costo";
    return this.http.post(URL, {}, {headers: headers});
  }
validateStock(){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/ecommerce/carts/validate-stock";
    return this.http.get(URL, {headers: headers});
  }
  checkout(data:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/ecommerce/checkout";
    return this.http.post(URL, data, {headers: headers});
  }

  showOrder(sale_id:string){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/ecommerce/sale/"+sale_id;
    return this.http.get(URL, {headers: headers});
  }

  // mercadopago(price_total:number = 0){
  //   let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
  //   let URL = "";
  //   if(PRODUCTION){
  //     URL = URL_SERVICIOS+"/ecommerce/mercadopago";
  //   } else {
  //     URL = "https://apiecommerce-production-9896.up.railway.app/api/ecommerce/mercadopago?price_unit="+price_total;
  //   }
  //   return this.http.get(URL, {headers: headers});
  // }

  // checkoutMercadoPago(data:any){
  //   let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
  //   let URL = URL_SERVICIOS+"/ecommerce/checkout-mercadopago";
  //   return this.http.post(URL, data, {headers: headers});
  // }

  mercadopago(price_total: number = 0) {
    let headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    let URL = "";

    if(PRODUCTION) {
      URL = URL_SERVICIOS + "/ecommerce/mercadopago";
    } else {
      URL = "https://apiecommerce-production-9896.up.railway.app/api/ecommerce/mercadopago";
    }

    // Cambiar de GET a POST y enviar price_unit en el body
    return this.http.post(URL, { price_unit: price_total }, { headers: headers });
}

checkoutMercadoPago(data: any) {
    let headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    let URL = URL_SERVICIOS + "/ecommerce/checkout-mercadopago";
    return this.http.post(URL, data, { headers: headers });
}

  storeTemp(data:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/ecommerce/checkout-temp";
    return this.http.post(URL, data, {headers: headers});
  }
}
