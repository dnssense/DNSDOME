import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { currentId } from 'async_hooks';
import { Observable, of } from 'rxjs';
import 'rxjs/add/observable/of';
export interface GeoLocation {
    ip: string;
    city: string;
    country: string;
    country_name: string;
    timezone: string;
    utc_offset: string;
    currency: string;
    languages: string;
    country_code_iso3: string;
    country_calling_code: string;

}
@Injectable({ providedIn: 'root' })
export class GeoLocationService {
    current: any;
    /**
     *
     */
    constructor(private http: HttpClient) {

        this.current = null;
    }
    getCurrent(): Observable<GeoLocation> {
        if (this.current) return Observable.of(this.current);
        return this.http.get<GeoLocation>('https://ipapi.co/json').map(x => {
            this.current = x;
            return this.current;
        });
    }
};