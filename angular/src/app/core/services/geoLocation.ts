import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
export interface GeoLocation {
    ip: string;
    city: string;
    country: string;
    country_name: string;
    timezone: string;
    utc_offset: string;
    currency: string;
    languages: string;

}
export const geoLocation = {
    getCurrent: (http: HttpClient): Observable<GeoLocation> => {
        return http.get<GeoLocation>('https://ipapi.co/json');
    }
};;