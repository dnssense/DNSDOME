import { Injectable } from '@angular/core';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private subject:Subject<boolean>;
  counter=0;
  constructor(private spinner:NgxUiLoaderService) {
    console.log('constructor spinnerservice');
    this.subject=new Subject<boolean>();
    this.subject.asObservable().subscribe((val)=>{
      if(val){
        this.counter++;
    if(this.counter==1){
      this.spinner.start();
    console.log('spinner start:'+this.counter);
    }
      }else{
        this.counter--;

    if(this.counter==0){
      
       this.spinner.stop();
       console.log('spinner stop:'+this.counter);
    }

      }

    })
  }
  show(){
    
    this.subject.next(true);
    
    
    
    
    
  }
  hide(){
    this.subject.next(false);
    
    
    
  }
}
