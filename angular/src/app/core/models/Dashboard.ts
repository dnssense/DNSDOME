import { SearchSetting } from '../models/SearchSetting';
import { KeyValueModel, TimeRangeEnum } from './Utility';
/**
 * Created by fatih on 02.09.2016.
 */
export class Dashboard {
  public id = -1;
  public name = '';
  public date = '';
  public user: string;
  public setting: SearchSetting[] = [];
  public changed = false;
  public saved = false;
  public refresh = -1;
  public isDefault = false;
  public system = false;
}

export class AgentCountModel {
  name: string;
  activeCount: number;
  passiveCount: number;
}

export class DateParamModel extends KeyValueModel<string, TimeRangeEnum> {
  dateParam = 0;
}

export interface HourlyCompanySummaryV5Request {
  duration?: number; // last hours
  startDate?: string;
  endDate?: string;
}



export interface Bucket {
  date: string;
  count: number;
  avg: number;
  std: number;
  sum: number;
}

export interface Category {
  name: string;
  type: string;
  buckets: Bucket[];
  hit?: number; // bunlar servisten gelmiyor
  hit_ratio?: number; // bunlar servisten gelmiyor
}
export interface Total {
  hit: number;
  block: number;
  buckets: Bucket[];
}

export interface Summary {
  hit: number;
  hit_ratio: number;
  buckets: Bucket[];
}
export interface HourlyCompanySummaryV5Response {
  categories: Category[];
  total: Total;
  safe: Summary;
  malicious: Summary;
  variable: Summary;
  harmful: Summary;
  hit: number;

}





export interface TopDomainsRequestV5 {
  duration?: number; // last hours
  startDate?: string; // utc
  endDate?: string;
  type: 'total'|'safe'| 'malicious' | 'new' | 'harmful'|string;

}

export interface Domain {
  name: string;
  hit: number;
  category?: string; // bunlar servisten gelmiyor
}
export interface TopDomainsResponseV5 {
  items: Domain[];
}




export interface TopDomainValuesRequestV4 {
  duration?: number; // last hours
  startDate?: string;
  endDate?: string;
  domain: string;

}

export interface Result {
  date: string;
  hit: number;
}
export interface TopDomainValuesResponseV4 {
  items: Result[];
}
