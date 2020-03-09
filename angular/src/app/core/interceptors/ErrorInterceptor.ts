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

     throw error;


    // Log the error anyway
    // console.error(error.name);
  }
}
