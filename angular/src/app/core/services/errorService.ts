import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentService } from './component.service';
import { NotificationService } from './notification.service';

/**
 * Created by fahri on 26.07.2017.
 */

@Injectable({ providedIn: 'root' })
export class ErrorService {
  constructor(
    public componentService: ComponentService,
    public notificationService: NotificationService
  ) {}

  public handleAuthenticatedError(error: HttpErrorResponse) {
    const status = error.status;

    let message = 'Problem';
    const statusText = error.statusText ? ':' + error.statusText : '';
    if (error instanceof SyntaxError) {
      console.log(error.message);
    } else if (error instanceof Error) {
      // A client-side or network error occurred. Handle it accordingly.
      message = error.message;
      if (message.indexOf('No JWT present') > -1) {
        message =
          'You\'are not logged in or  your session has expired.Please login again';
        this.componentService.openLoginScreen();
      } else {
        console.log('An error occurred:', error.message);
        message = error.message;
        this.notificationService.error(message);
      }
    } else {
      switch (status) {
        case 0: {
          message =
            'An error occurred while processing your request. Please try again later:' +
            statusText;
          break;
        }
        case 200: {
          break;
        }
        case 210: {
          break;
        }
        case 400: {
          break;
        }
        case 404: {
          message =
            'The requested resource could not be located on the server. Please try again later.' +
            statusText;
          break;
        }
      }
      console.log(
        `Backend returned code ${error.status}, body was: ${error.error}`
      );
      this.notificationService.error(message);
    }
  }

  public handleError(error: HttpErrorResponse) {
    const status = error.status;

    let message = 'Problem';
    const statusText = error.statusText ? ':' + error.statusText : '';
    if (error.error instanceof Error) {
      // A client-side or network error occurred. Handle it accordingly.
      console.log('An error occurred:', error.error.message);
      message = error.error.message;
    } else {
      switch (status) {
        case 0: {
          message =
            'An error occurred while accessing server.Please try again later:' +
            statusText;
          break;
        }
        case 200: {
          break;
        }
        case 210: {
          break;
        }
        case 400: {
          break;
        }
        case 404: {
          message =
            'The requested resource could not be located on the server. Please try again later.' +
            statusText;
          break;
        }
      }
      console.log(
        `Backend returned code ${error.status}, body was: ${error.error}`
      );
    }

    this.notificationService.error(message);
  }
}
