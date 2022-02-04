import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { PublicIP } from '../models/PublicIP';
import { WAgentIpGroup } from '../models/WAgentIpGroup';
import { OperationResult } from '../models/OperationResult';
import { GeoLocationService } from './geoLocationService';


@Injectable({ providedIn: 'root' })
export class PublicIPService {


  constructor(private http: HttpClient, private config: ConfigService, private geoLocation: GeoLocationService) {

  }

  public getMyIp(): Observable<any> {

    return this.geoLocation.getCurrent().map(res => res.ip);
  }


}


