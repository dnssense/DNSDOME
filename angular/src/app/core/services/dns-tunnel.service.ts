import { HttpClient, HttpHeaders } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import {
  BaseFilterUIRequestModel,
  BaseUIResponseModel,
  RowDef,
  TunnelStatsQueryTypeItem,
} from 'roksit-lib'
import { Observable } from 'rxjs'
import { mapBaseUIFilterRequestToServiceModel } from '../models/BaseModelsV2'
import { ConfigService } from './config.service'

// tslint:disable-next-line:no-empty-interface
export interface DnsTunnelHistogramUIRequest extends BaseFilterUIRequestModel {
  time_info?: {
    interval: string
    time_zone?: string
  }
}
export interface DnsTunnelHistogramUIResponse extends BaseUIResponseModel<DnsTunnelHistogramItem> {}
export interface DnsTunnelHistogramItem {
  date: number
  high?: number
  suspicious?: number
}

// tslint:disable-next-line:no-empty-interface
export interface DnsTunnelSuspiciousEventsUIRequest extends BaseFilterUIRequestModel {}
export interface DnsTunnelSuspiciousEventsUIResponse
  extends BaseUIResponseModel<DnsTunnelSuspiciousEventsItem> {}
export interface DnsTunnelSuspiciousEventsItem extends RowDef {
  domain: string
  'company.hits': number
  fqdns_samples: string[]
  severity: string
  event_start_date: Date
  event_end_date: Date
  sourceIp: string
  'other.fqdn_hit_ratio': number
  'other.fqdn_count': number
  'other.fail_ratio': number
  'company.fqdn_hit_ratio': number
  'company_lw.hits': number
  'company_lw.fail_ratio': number
  'company_lw.fqdn_count': number
  'company_lw.fqdn_hit_ratio': number
  'company.fail_ratio': number
  'company.fail_count': number
  'company.success_count': number
  'company.fqdn_count': number
  'company.unique_response': number
  'company_lw.queried_before': number
  'res_dga.ratio': number
  query_types: TunnelStatsQueryTypeItem
}

// tslint:disable-next-line:no-empty-interface
export interface DnsTunnelSuspiciousTrafficUIRequest extends BaseFilterUIRequestModel {}
export interface DnsTunnelSuspiciousTrafficUIResponse
  extends BaseUIResponseModel<DnsTunnelSuspiciousTrafficItem> {}
export interface DnsTunnelSuspiciousTrafficItem extends RowDef {
  domain: string
  time: string
  subdomain: string
  sourceIp: string
  sourceIpCountryCode: string
  destinationIp: string
  destinationIpCountryCode: string
  location: string
  action: boolean
  blockReason: string
  applicationName: string
  category: string[]
}
export class BlockListResponse {
  status: number
  message: string
  results: BlockListItem[]
}
export class BlockListItem {
  id: number
  companyId: number
  domain: string
  target_hosts: string[]
  expiration: Date
  policy_type: number
}

export class WhiteListResponse {
  status: number
  message: string
  results: WhiteListItem[]
}
export class WhiteListItem {
  id: number
  record: string
  recordDetail: string
  companyId: number
  constructor(item: WhiteListItem) {
    this.id = item.id
    this.record = item.record
    this.recordDetail = item.recordDetail
    this.companyId = item.companyId
  }
}

export enum DnsTunnelColumns {
  ISTunnel = 'is_tunnel',
}

export enum DnsTunnelLevel {
  High = 'high',
  Suspicious = 'suspicious',
}

@Injectable({
  providedIn: 'root',
})
export class DnsTunnelService {
  private http = inject(HttpClient)
  private config = inject(ConfigService)
  private baseUrl = this.config.getApiUrl() + '/investigation/v1'
  headers = {
    'Content-Type': ['application/json'],
  }
  getHistogram(req: DnsTunnelHistogramUIRequest): Observable<DnsTunnelHistogramUIResponse> {
    const serviceReq = mapBaseUIFilterRequestToServiceModel(
      req as BaseFilterUIRequestModel
    ) as DnsTunnelHistogramUIRequest
    serviceReq.time_info = req.time_info
    return this.http
      .post<DnsTunnelHistogramUIResponse>(this.baseUrl + '/suspicious/histogram', serviceReq, {
        headers: new HttpHeaders(this.headers),
      })
      .pipe()
  }
  getSuspiciousEvents(
    req: DnsTunnelSuspiciousEventsUIRequest
  ): Observable<DnsTunnelSuspiciousEventsUIResponse> {
    return this.http
      .post<DnsTunnelSuspiciousEventsUIResponse>(
        this.baseUrl + '/suspicious/events',
        mapBaseUIFilterRequestToServiceModel(req as BaseFilterUIRequestModel),
        { headers: new HttpHeaders(this.headers) }
      )
      .pipe()
  }
  getSuspiciousTraffic(
    req: DnsTunnelSuspiciousTrafficUIRequest
  ): Observable<DnsTunnelSuspiciousTrafficUIResponse> {
    return this.http
      .post<DnsTunnelSuspiciousTrafficUIResponse>(
        this.baseUrl + '/suspicious/traffic',
        mapBaseUIFilterRequestToServiceModel(req as BaseFilterUIRequestModel),
        { headers: new HttpHeaders(this.headers) }
      )
      .pipe()
  }
  getBlockList(): Observable<BlockListResponse> {
    return this.http
      .get<BlockListResponse>(this.config.getApiUrl() + '/policy/responder-policy/company', {
        headers: new HttpHeaders(this.headers),
      })
      .pipe()
  }
  getWhiteList(): Observable<WhiteListResponse> {
    return this.http
      .get<WhiteListResponse>(this.config.getApiUrl() + '/tunnel-incident/exception/domain', {
        headers: new HttpHeaders(this.headers),
      })
      .pipe()
  }
  saveWhiteList(domain: string): Observable<WhiteListResponse> {
    return this.http
      .post<WhiteListResponse>(
        this.config.getApiUrl() + '/tunnel-incident/exception/domain',
        { domain: domain },
        { headers: new HttpHeaders(this.headers) }
      )
      .pipe()
  }
  deleteWhiteList(id: number): Observable<WhiteListResponse> {
    return this.http
      .delete<WhiteListResponse>(
        this.config.getApiUrl() + '/tunnel-incident/exception/domain/' + id,
        { headers: new HttpHeaders(this.headers) }
      )
      .pipe()
  }
  deleteAllBlockedList(): Observable<BlockListResponse> {
    return this.http
      .delete<BlockListResponse>(this.config.getApiUrl() + '/tunnel-incident/incident', {
        headers: new HttpHeaders(this.headers),
      })
      .pipe()
  }
}
