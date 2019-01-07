import { Injectable } from '@angular/core';
import swal from 'sweetalert2';
import { Observable, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';

declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  successTitle: 'Successful';
  successMessage: 'Operation successfully completed.';

  constructor() { }

  alertBasic(title: string) {
    swal({
      title: title,
      buttonsStyling: false,
      confirmButtonClass: "btn btn-success"
    }).catch(swal.noop)
  }

  alertTitleAndText(title: string, message: string) {
    swal({
      title: title,
      text: message,
      buttonsStyling: false,
      confirmButtonClass: "btn btn-info"
    }).catch(swal.noop)
  }

  alertSuccessMessage(title: string, message: string) {
    swal({
      title: title,
      text: message,
      buttonsStyling: false,
      confirmButtonClass: "btn btn-success",
      type: "success"
    }).catch(swal.noop)
  }

  alertMessageAndConfirmation(title: string, message: string): Observable<any> {
   return Observable.fromPromise(swal({
      title: title,
      text: message,
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'Yes',
      buttonsStyling: false
    })
   ).pipe(
    map(result => {
      if (result.value) { return true; }
      else { return false; }
    }
    )
  )
  }

  alertWarningAndCancel(title: string, message: string): Observable<boolean> {
    
    return Observable.fromPromise(swal({
      title: title,
      text: message,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Tamam',
      cancelButtonText: 'İptal',
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      buttonsStyling: false
    })
    ).pipe(
      map(result => {
        if (result.value) { return true; }
        else { return false; }
      }
      )
    )
  }

  alertCustomHtml(title: string, htmlMessage: string) {
    swal({
      title: title,
      buttonsStyling: false,
      confirmButtonClass: "btn btn-success",
      html: htmlMessage
    }).catch(swal.noop)
  }

  alertAutoClose(title: string, message: string, time: number) {
    swal({
      title: title,
      text: message,
      timer: time,
      showConfirmButton: false
    }).catch(swal.noop)
  }

  alertInputField(title: string, message: string) {
    swal({
      title: title,
      html: '<div class="form-group">' +
        '<input id="input-field" type="text" class="form-control" />' +
        '</div>',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false
    }).then(function (result) {
      swal({
        type: 'success',
        html: 'You entered: <strong>' +
          $('#input-field').val() +
          '</strong>',
        confirmButtonClass: 'btn btn-success',
        buttonsStyling: false

      })
    }).catch(swal.noop)
  }


}
