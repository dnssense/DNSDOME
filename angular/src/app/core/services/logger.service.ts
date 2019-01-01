import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() { }

  console(msg:any){
    if(environment.production==false)
    console.log(msg);
  }
}
