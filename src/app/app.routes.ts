import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { LandingProductComponent } from './pages/guest-view/landing-product/landing-product.component';
import { authGuard } from './pages/auth/service/auth.guard';
import { CartComponent } from './pages/view-auth/cart/cart.component';
import { CheckoutComponent } from './pages/view-auth/checkout/checkout.component';
import { ThankYouOrderComponent } from './pages/view-auth/thank-you-order/thank-you-order.component';
import { CheckoutSuccessComponent } from './pages/view-auth/checkout/checkout-success/checkout-success.component';
import { CheckoutFailureComponent } from './pages/view-auth/checkout/checkout-failure/checkout-failure.component';
import { CheckoutPendingComponent } from './pages/view-auth/checkout/checkout-pending/checkout-pending.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {

        path: 'login',
        component: LoginComponent
    },
    {
      // canActivate:[authGuard],
        path: 'register',
        component: RegisterComponent
    },
    {
      path: 'cambiar-contraseña',
      component: ForgotPasswordComponent
    },
    {
      path: 'producto/:slug',
      component: LandingProductComponent
    },
    {
      canActivate:[authGuard],
        path: 'carrito-de-compra',
        component: CartComponent
    },
    {
      canActivate:[authGuard],
        path: 'proceso-de-pago',
        component: CheckoutComponent
    },
    {
      canActivate:[authGuard],
        path: 'gracias-por-tu-compra/:order',
        component: ThankYouOrderComponent
    },
    {
      canActivate:[authGuard],
        path: 'mercado-pago-success',
        component: CheckoutSuccessComponent
    },
    {
      canActivate:[authGuard],
        path: 'mercado-pago-failure',
        component: CheckoutFailureComponent
    },
    {
      canActivate:[authGuard],
        path: 'mercado-pago-pending',
        component: CheckoutPendingComponent
    },
];
