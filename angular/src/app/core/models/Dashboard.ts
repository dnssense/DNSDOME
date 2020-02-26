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

export class DataPanelModel {
  name: string;
  activeCount: number;
  passiveCount: number;
}

export class DateParamModel extends KeyValueModel<string, TimeRangeEnum> {
  dateParam = 0;
}

export interface HourlyCompanySummaryV4Request {
  duration: number; // last hours
}

export interface StdDeviationBounds {
  upper: number;
  lower: number;
}

export interface UniqueBlockedDomain {
  average: number;
  std_deviation_bounds: StdDeviationBounds;
  count: number;
  std_deviation: number;
}

export interface UniqueDomain {
  average: number;
  std_deviation_bounds: StdDeviationBounds;
  count: number;
  std_deviation: number;
}

export interface TotalHit {
  average: number;
  std_deviation_bounds: StdDeviationBounds;
  count: number;
  std_deviation: number;
}

export interface CategorySummary {
  name: string;
  hits: number;
  average: number;
  unique_domain: number;
  std_deviation_bounds: StdDeviationBounds;
  unique_domain_average: number;
  std_deviation: number;
}

export interface UniqueDestip {
  average: number;
  count: number;
}

export interface BlockedCount {
  average: number;
  std_deviation_bounds: StdDeviationBounds;
  count: number;
  std_deviation: number;
}

export interface UniqueSrcip {
  average: number;
  count: number;
}

export interface TimeRange {
  hit: number;
  hour_gte: string;
  lt: Date;
  gte: Date;
}

export interface UniqueMac {
  average: number;
  count: number;
}

export interface UniqueUser {
  average: number;
  count: number;
}

export interface AllowedCount {
  average: number;
  std_deviation_bounds: StdDeviationBounds;
  count: number;
  std_deviation: number;
}

export interface UniqueSubdomain {
  average: number;
  std_deviation_bounds: StdDeviationBounds;
  count: number;
  std_deviation: number;
}

export interface Summary {
  unique_blocked_domain: UniqueBlockedDomain;
  date: string;
  unique_domain: UniqueDomain;
  total_hit: TotalHit;
  firstly_seen_status: string;
  len_firstly_seen_domains: number;
  insert_date: Date;
  query_process_time: number;
  category_hits: CategorySummary[];
  unique_destip: UniqueDestip;
  blocked_count: BlockedCount;
  unique_srcip: UniqueSrcip;
  time_range: TimeRange;
  unique_mac: UniqueMac;
  unique_user: UniqueUser;
  allowed_count: AllowedCount;
  unique_subdomain: UniqueSubdomain;
}

export interface HourlyCompanySummaryV4Response {
  items: Summary[];
}

export interface TrafficTotal {
  date: Date;
  hit: number;
}

export interface TrafficAnomalyCategory {
  name: string;
  hitCount: number;
  ratio: number;
}

export interface TrafficAnomalyItem {
  allowCount: number;
  blockCount: number;
  categories: TrafficAnomalyCategory[];
  averageHit: number;
  currentHit: number;
  ratio: number;

}

export interface TrafficAnomalyItem2 {
  hitCount: number;
  uniqueCount: number;
  categories: TrafficAnomalyCategory[];
  averageHit: number;
  currentHit: number;
  ratio: number;
}

export interface TrafficAnomaly {
  total: TrafficAnomalyItem;
  malicious: TrafficAnomalyItem2;
  variable: TrafficAnomalyItem2;
  harmful: TrafficAnomalyItem2;
  safe: TrafficAnomalyItem2;
}

export interface Domain {
  name: string;
  hit: number;
}

export interface Domain {
  name: string;
  hit: number;
}

export interface TopDomainsResponseV4 {
  items: Domain[];
}

export interface TopDomainValuesRequestV4 {
  duration: number; // last hours
  domain: string;
}

export interface Result {
  date: string;
  hit: number;
}

export interface TopDomainValuesResponseV4 {
  items: Result[];
}
