import { Injectable } from '@angular/core';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private subject: Subject<boolean>;

  constructor(private spinner: NgxUiLoaderService) {
    console.log('constructor spinnerservice');
    this.subject = new Subject<boolean>();
    this.subject.asObservable().subscribe((val) => {
      if (val) {
        //console.log('spinner start check:' + this.spinner.hasForeground());
        if (!this.spinner.hasForeground('loader')) {
          this.spinner.start('loader');
        }
        //console.log('spinner start:' + this.spinner.hasForeground());
      } else {
        //console.log('spinner stop check:' + this.spinner.hasForeground());
        if (this.spinner.hasForeground('loader')) {
          this.spinner.stop('loader');
        }
       // console.log('spinner stop:' + this.spinner.hasForeground());
      }
    });
  }
  show() {
    this.subject.next(true);
  }

  hide() {
    this.subject.next(false);
  }
}
