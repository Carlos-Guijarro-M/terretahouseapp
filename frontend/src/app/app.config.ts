import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: '6LcEpxMtAAAAAF0gOvZ_nijN04x01GYYb-RqSki8',
      } as RecaptchaSettings,
    },
  ]
};