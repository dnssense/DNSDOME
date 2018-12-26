import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor() { }

  getApiUrl():string{
    return environment.production?"https://management.dnssense.com/api":"https://localhost:3200/api";
  }
}
