import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Box } from '../models/Box';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class BoxService {
  private getBoxesURL = this.config.getApiUrl() + '/agent/box';
  private saveBoxURL = this.config.getApiUrl() + '/agent/box';
  private deleteBoxURL = this.config.getApiUrl() + '/agent/box';
  private virtualBoxURL = this.config.getApiUrl() + '/box/virtual';
  private getLinkURL = this.config.getApiUrl() + '/box/roamingclientlink';
  private boxConfURL = this.config.getApiUrl() + '/box/conf';
  private boxMagicURL = this.config.getApiUrl() + '/box/roamingclientconfig/magic';

  constructor(private http: HttpClient, private config: ConfigService) { }

  getBoxes(): Observable<Box[]> {
    return this.http.get<Box[]>(this.getBoxesURL).map(data => data);
  }

  saveBox(box: Box): Observable<Box> {
    return this.http.post<Box>(this.saveBoxURL, box, this.getOptions()).map(data => data);
  }

  deleteBox(id: number): Observable<{}> {
    return this.http.delete<{}>(this.deleteBoxURL + `/${id}`, this.getOptions()).map(res => res);
  }

  getVirtualBox(): Observable<Box> {
    return this.http.get<Box>(this.virtualBoxURL).map(data => data);
  }

  getProgramLink(): Observable<any> {
    return this.http.get<any>(this.getLinkURL).map(data => data);
  }

  getMagicLink(): Observable<any> {
    return this.http.get<any>(this.boxMagicURL).map(data => {
      data.magic = this.config.getApiUrl() + data.magic;
      return data;
    });
  }


  saveBoxConfig(request: { box: string, uuid: string, donttouchdomains: string, donttouchips: string, localnetips: string, uninstallPassword: string, disablePassword: string }) {

    return this.http.post<any>(this.boxConfURL, request).map(data => data);
  }

  private getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return options;
  }
}
