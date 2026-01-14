import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { PermisionAuth } from './pages/auth/service/auth.guard';
import { SocialAuthServiceConfig, GoogleLoginProvider } from '@abacritt/angularx-social-login';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideToastr(),
    provideHttpClient(withFetch()),
    provideClientHydration(),
    CookieService,
    PermisionAuth,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false, // Evita que intente loguearse solo al cargar la página
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '686092597188-puede3ekg6dknif721uj1iqjl8kumnk5.apps.googleusercontent.com',
              {oneTapEnabled: false,
              prompt: 'select_account'}

            )
          }
        ],
        onError: (err) => {
          console.error('Error en SocialAuthService: ', err);
        }
      } as SocialAuthServiceConfig,
    }
  ]
};