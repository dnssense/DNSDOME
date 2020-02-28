import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';
import { Box } from '../models/Box';
import { OperationResult } from '../models/OperationResult';

@Injectable({
  providedIn: 'root'
})
export class BoxService {
  private getBoxesURL = this.config.getApiUrl() + '/agent/box';
  private saveBoxURL = this.config.getApiUrl() + '/agent/box';
  private deleteBoxURL = this.config.getApiUrl() + '/agent/box';
  private virtualBoxURL = this.config.getApiUrl() + '/box/virtual';
  private getLinkURL = this.config.getApiUrl() + '/box/roamingclientlink';

  constructor(private http: HttpClient, private config: ConfigService) { }

  getBoxes(): Observable<Box[]> {
    return this.http.get<Box[]>(this.getBoxesURL).map(data => data);
  }

  saveBox(box: Box): Observable<Box> {
    return this.http.post<Box>(this.saveBoxURL, box, this.getOptions()).map(data => data);
  }

  deleteBox(id: number): Observable<{}> {
    debugger;
    return this.http.delete<{}>(this.deleteBoxURL + `/${id}`, this.getOptions()).map(res => res);
  }

  getVirtualBox(): Observable<Box> {

    return this.http.get<Box>(this.virtualBoxURL).map(data => data);
  }

  getProgramLink(request: { donttouchdomains: string }): Observable<any> {
    debugger;
    return this.http.post<any>(this.getLinkURL, request).map(data => data);
  }

  private getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return options;
  }
}
