import {inject, Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ConfigService} from './config.service';
import {
  CompanyLicenceServiceResponse,
  LicencePageServiceResponse,
  LicencePageUpdateServiceResponse,
  mapCompanyLicenceServiceResponseToUI,
  mapLicencePageServiceResponseToUI,
  mapLicencePageUIRequestToService,
  mapLicencePageUpdateServiceResponseToUI,
  mapLicencePageUpdateUIRequestToService,
  mapUpdateLicenceServiceResponseToUI,
  mapUpdateLicenceUIRequestToService,
  UpdateLicenceServiceResponse
} from '../models/ProductLicenceModel';
import {catchError, map, shareReplay} from 'rxjs/operators';
import {
  CompanyLicenceUIResponse,
  LicencePageUIRequest, LicencePageUIResponse,
  LicencePageUpdateUIRequest,
  LicencePageUpdateUIResponse, LicenceProductCode, ProductLicenceService, UpdateLicenceUIRequest,
  UpdateLicenceUIResponse
} from 'roksit-lib';


@Injectable({
    providedIn: 'root'
})
export class ProductLicenceServiceImpl implements ProductLicenceService  {
    private http = inject(HttpClient);
    private config = inject(ConfigService);
    private baseUrl = this.config.getApiUrl();
    private cacheTime = 5 * 60 * 1000;
    private histCacheMap = new Map<number, {cacheTime: number, data: Observable<CompanyLicenceUIResponse>} >();
    headers = {
        'Content-Type': ['application/json']
    };
    clearCache() {
      this.histCacheMap = new Map<number, {cacheTime: number, data: Observable<CompanyLicenceUIResponse>}>();
    }
    updateLicence(req: UpdateLicenceUIRequest): Observable<UpdateLicenceUIResponse> {
      return this.http.put<UpdateLicenceServiceResponse>(this.baseUrl + '/licence/licence', mapUpdateLicenceUIRequestToService(req), {headers: new HttpHeaders(this.headers)}).pipe(
        map((data) => {
          return mapUpdateLicenceServiceResponseToUI(data);
        })
      );
    }
    getCompanyLicence(productCode: LicenceProductCode, clearCache?: boolean): Observable<CompanyLicenceUIResponse> {
      if (!clearCache && this.histCacheMap.has(productCode.valueOf())) {
          const cacheData = this.histCacheMap.get(productCode.valueOf());
          if (cacheData && cacheData.cacheTime && cacheData.data &&  Date.now() - cacheData.cacheTime < this.cacheTime ) {
            return  cacheData.data;
          }
      }
      const res$ = this.http.get<CompanyLicenceServiceResponse>(this.baseUrl + '/licence/licence/' + productCode.valueOf(), {headers: new HttpHeaders(this.headers)}).pipe(
                  map((data) => {
                    return mapCompanyLicenceServiceResponseToUI(data);
                  }),
                  shareReplay(1, this.cacheTime)
      );
      this.histCacheMap.set(productCode.valueOf(), {cacheTime: Date.now(), data: res$});
      return res$;
    }
    getLicencePageData(req: LicencePageUIRequest): Observable<LicencePageUIResponse> {
      return this.http.post<LicencePageServiceResponse>(this.baseUrl + '/licence/apply/get', mapLicencePageUIRequestToService(req), {headers: new HttpHeaders(this.headers)}).pipe(
        map((data) => {
          return mapLicencePageServiceResponseToUI(data);
        }),
        catchError( (err) => {
          return of(undefined);
        })
      );
    }
    updateLicencePageData(req: LicencePageUpdateUIRequest): Observable<LicencePageUpdateUIResponse> {
      return this.http.post<LicencePageUpdateServiceResponse>(this.baseUrl + '/licence/apply/update', mapLicencePageUpdateUIRequestToService(req), {headers: new HttpHeaders(this.headers)}).pipe(
        map((data) => {
          return mapLicencePageUpdateServiceResponseToUI(data);
        })
      );
    }

    activateLicence(key: string) {
      return this.http.post<any>(this.baseUrl + '/licence/activate', {key: key}, {headers: new HttpHeaders(this.headers)});
    }
}
