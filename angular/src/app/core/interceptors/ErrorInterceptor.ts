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
          const message = translatorService.translate(error.error.code);
          console.log(`${status} - ${message}`);
          notificationService.error(message);
          /* if (error.error.code != 'ErrOAuthJwtVerificationFailed') {
            // notificationService.error(`${message}`);
          } */
        } else {

          const message = translatorService.translate(error.statusText);
          // notificationService.error(translatorService.translate('ErrOAuthUnknownError'));
          notificationService.error(message);
          console.log(`${status} - ${message}`);
        }
      }
    } else {

      const message = translatorService.translate(error.message);
      // debugger;
      console.log(message);
      if (!(message.includes('\'push\' of undefined') && error.stack.includes('reports-module'))) { // TODO: will remove; after unfound push error fixed
        // notificationService.error('Error');
      }
    }
    // Log the error anyway
    // console.error(error.name);
  }
}
