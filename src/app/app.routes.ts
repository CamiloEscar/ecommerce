import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { LandingProductComponent } from './pages/guest-view/landing-product/landing-product.component';
import { authGuard } from './pages/auth/service/auth.guard';
import { CartComponent } from './pages/view-auth/cart/cart.component';

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
];
