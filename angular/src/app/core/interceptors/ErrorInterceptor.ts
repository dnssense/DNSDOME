import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../services/notification.service';
import { SpinnerService } from '../services/spinner.service';
import { TranslatorService } from '../services/translator.service';
import { environment } from 'src/environments/environment';

// errors-handler.ts
@Injectable()
export class ErrorInterceptor implements ErrorHandler {
  constructor(
    // Because the ErrorHandler is created before the providers, we’ll have to use the Injector to get them.
    private injector: Injector
  ) { }

  handleError(error: Error | HttpErrorResponse) {

    console.log("Env: " + environment.production);

    const notificationService = this.injector.get(NotificationService);
    const spinnerService = this.injector.get(SpinnerService);
    spinnerService.hide();
    const translatorService = this.injector.get(TranslatorService);
    if (error instanceof HttpErrorResponse) {
      // Server or connection error happened
      if (!navigator.onLine) {
        notificationService.danger('No Internet Connection');
      } else {
        // Handle Http Error (error.status === 403, 404...)
        const status = error.status;
        if (error.error.code) {
          let message = translatorService.translate(error.error.code);
          console.log(`${status} - ${message}`);
          notificationService.error('Error ' + status);
        } else {
          let message = translatorService.translate(error.statusText);
          if (environment.production == false) {
            notificationService.error(`${status} - ${message}`);
          } else {
            notificationService.error(translatorService.translate('ErrOAuthUnknownError'));
            console.log(`${status} - ${message}`);
          }
        }
      }
    } else {
      const message = translatorService.translate(error.message);
      console.log(message);
      notificationService.error('Error');
    }
    // Log the error anyway
    //console.error(error.name);
  }
}