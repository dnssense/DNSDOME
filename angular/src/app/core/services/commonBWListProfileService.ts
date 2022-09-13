
import {of as observableOf,  Observable } from 'rxjs';

import {map} from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Box } from '../models/Box';
import { CommonBWListProfile } from '../models/CommonBWListProfile';
import { LogColumn } from '../models/LogColumn';
import { ConfigService } from './config.service';

interface GetResponse {
    items: CommonBWListProfile[];
    count: number;
}

@Injectable({
    providedIn: 'root'
})
export class CommonBWListProfileService {



    private getList = this.config.getApiUrl() + '/commonbwlistprofile';
    private saveList = this.config.getApiUrl() + '/commonbwlistprofile';
    private deleteList = this.config.getApiUrl() + '/commonbwlistprofile';


    constructor(private http: HttpClient, private config: ConfigService) { }

    getCommonBWListProfile(page: number, pageSize: number): Observable<GetResponse> {
        const params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());

        return this.http.get<GetResponse>(this.getList, { params }).pipe(map(data => data));
    }
    searchCommonBWListProfile(domain: string, page: number, pageSize: number): Observable<{ items: CommonBWListProfile[], count: number }> {
        const params = new HttpParams().set('domain', domain).set('page', page.toString()).set('pageSize', pageSize.toString());

        return this.http.get<any>(this.getList, { params }).pipe(map(data => data));
    }

    saveCommonBWListProfile(items: CommonBWListProfile[]) {
        return this.http.post(this.saveList, { items: items });
    }

    deleteCommonBWListProfile(items: CommonBWListProfile[]): Observable<GetResponse> {
        const params = new HttpParams().set('domains', items.map(x => x.domain).join(','))

        return this.http.delete<GetResponse>(this.getList, { params }).pipe(map(data => data));
    }



    private getOptions() {
        const options = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        };
        return options;
    }

    public initTableColumns(): Observable<LogColumn[]> {
        return observableOf([
            { 'name': 'id', 'beautyName': 'Id', 'hrType': '', 'aggsType': 'TERM', 'checked': true, inputPattern: /^[a-z0-9@_*?-]*$/i },
            { 'name': 'domain', 'beautyName': 'Domain', 'hrType': '', 'aggsType': 'TERM', 'checked': true, inputPattern: /^[a-z0-9@_*?-]*$/i },
            { 'name': 'isBlocked', 'beautyName': 'IsBlocked', 'hrType': '', 'aggsType': 'TERM', 'checked': true, placeholder: '1 or 0', inputPattern: /^[01]$/ },
            { 'name': 'insertDate', 'beautyName': 'InsertDate', 'hrType': 'DNS_DATETIME', 'aggsType': '', 'checked': true, hide: true },
            { 'name': 'comment', 'beautyName': 'Comment', 'hrType': '', 'aggsType': 'TERM', 'checked': true, inputPattern: /^[a-z0-9@_*?-]*$/i },] as LogColumn[]
        );
    }
}
