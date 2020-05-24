import { ColumnTagInput } from '../models/ColumnTagInput';
import { ConfigItem } from '../models/ConfigItem';
import { ScheduledReport } from '../models/ScheduledReport';

export type SearchSettingsType = 'roksit' | 'roksitblock' | string;

/**
 * Created by fatih on 03.08.2016.
 */

export class SearchSetting {
  id = -1;
  name = '';
  // refresh = -1;
  dateInterval = 5;
  type: SearchSettingsType = 'roksit';
  topNumber = 10;
  query: string;
  must: ColumnTagInput[] = [];
  mustnot: ColumnTagInput[] = [];
  should: ColumnTagInput[] = [];
  columns: ConfigItem = new ConfigItem();
  visible = false;
  system = false;
  scheduledReport: ScheduledReport;
  // chartType: string;
  // config: Object;

  selected ?= false;

  startDate?: string;
  endDate?: string;

}
