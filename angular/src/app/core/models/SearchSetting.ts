import { ColumnTagInput } from '../models/ColumnTagInput';
import { ConfigItem } from '../models/ConfigItem';
import { ScheduledReport } from '../models/ScheduledReport';
/**
 * Created by fatih on 03.08.2016.
 */

export class SearchSetting {

  id = -1;
  name = '';
  refresh = -1;
  dateInterval = '5';
  type = 'roksit';
  topNumber = 10;
  query: string;
  must: ColumnTagInput[] = [];
  mustnot: ColumnTagInput[] = [];
  should: ColumnTagInput[] = [];
  columns: ConfigItem = new ConfigItem();
  visible = false;
  system = false;
  scheduledReport: ScheduledReport;
  chartType: string;
  config: Object;

  selected ?= false;

  public getMaxTime() {
    let date = 0;

    if (this.dateInterval.indexOf('-') < 0) {
      date = new Date().getTime();
    }

    return date;
  }

  public getMinTime() {
    let date = 0;

    if (this.dateInterval.indexOf('-') < 0) {
      date = new Date().getTime() - parseInt(this.dateInterval, null) * 60 * 1000;
    }

    return date;
  }

}
