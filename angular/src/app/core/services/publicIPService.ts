import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { PublicIP } from '../models/PublicIP';
import { WAgentIpGroup } from '../models/WAgentIpGroup';
import { OperationResult } from '../models/OperationResult';
import { geoLocation } from 'src/app/core/services/geoLocation';

@Injectable({ providedIn: 'root' })
export class PublicIPService {


  constructor(private http: HttpClient, private config: ConfigService) {

  }

  public getMyIp(): Observable<any> {

    return geoLocation.getCurrent(this.http).map(res => res.ip);
  }


}


