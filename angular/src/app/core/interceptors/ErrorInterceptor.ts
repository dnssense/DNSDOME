import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../services/notification.service';
import { SpinnerService } from '../services/spinner.service';


// errors-handler.ts
@Injectable()
export class ErrorInterceptor implements ErrorHandler {
  constructor(
    // Because the ErrorHandler is created before the providers, we’ll have to use the Injector to get them.
    private injector: Injector,
  ) { }

  handleError(error: Error | HttpErrorResponse) {
    
          
    
    const notificationService = this.injector.get(NotificationService);    
    
    if (error instanceof HttpErrorResponse) {
      // Server or connection error happened
      if (!navigator.onLine) {

        notificationService.danger('No Internet Connection');
      } else {
        // Handle Http Error (error.status === 403, 404...)
        notificationService.error(`${error.status} - ${error.message}`);
      }
    } else
      {
        notificationService.error(error.message);
      }
    // Log the error anyway
    //console.error(error.name);
  }
}