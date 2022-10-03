import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SpinnerService } from '../services/spinner.service';
import { TranslatorService } from '../services/translator.service';
import { environment } from 'src/environments/environment';
import { RkNotificationService } from 'roksit-lib';

// errors-handler.ts
@Injectable()
export class ErrorInterceptor implements ErrorHandler {
  constructor(
    // Because the ErrorHandler is created before the providers, we’ll have to use the Injector to get them.
    private injector: Injector
  ) { }

  handleError(error: Error | HttpErrorResponse) {
    const notificationService = this.injector.get(RkNotificationService);
    const spinnerService = this.injector.get(SpinnerService);
    spinnerService.hide();
    const translatorService = this.injector.get(TranslatorService);

    // throw error;

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
          if (error.error.code != 'ErrOAuthJwtVerificationFailed') {
            notificationService.error(`${message}`);
          }
        } else
          if (error.statusText == 'Service Temporarily Unavailable') {
            const message = translatorService.translate(error.statusText);
            notificationService.error(translatorService.translate(message));
            console.log(`${status} - ${message}`);

          } else
            if (error.statusText == 'Bad Gateway') {
              const message = translatorService.translate(error.statusText);
              notificationService.error(translatorService.translate(message));
              console.log(`${status} - ${message}`);
            } else
              if (error.statusText == 'Gateway Timeout') {
                const message = translatorService.translate(error.statusText);
                notificationService.error(translatorService.translate(message));
                console.log(`${status} - ${message}`);
              } else {

                const message = translatorService.translate(error.statusText);
                notificationService.error(translatorService.translate('ErrOAuthUnknownError'));
                console.log(`${status} - ${message}`);
              }
      }
    } else {

      const message = translatorService.translate(error.message);
      console.log(message);
      //throw error;  remove this comment to view error on your local. it causes errorinterceptor to not intercept errors.
      // if (!(message.includes('\'push\' of undefined') && error.stack.includes('reports-module'))) { // TODO: will remove; after unfound push error fixed
      //   notificationService.error('Error');
      // }
    }


    // Log the error anyway
    if (error && error.name)
      console.log(error.name);
  }
}
