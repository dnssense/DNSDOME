import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { GeoLocationService } from './geoLocationService';
import { map } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class PublicIPService {


  constructor(private http: HttpClient, private config: ConfigService, private geoLocation: GeoLocationService) {

  }

  public getMyIp(): Observable<any> {

    return this.geoLocation.getCurrent().pipe(map(res => res.ip));
  }


}


