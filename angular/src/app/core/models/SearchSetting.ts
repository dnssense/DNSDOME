import { ColumnTagInput } from "../models/ColumnTagInput";
import { ConfigItem } from "../models/ConfigItem";
import { ScheduledReport } from "../models/ScheduledReport";
/**
 * Created by fatih on 03.08.2016.
 */

export class SearchSetting {
  public id: number = -1;
  public name: string = "";
  public refresh: number = -1;
  public dateInterval: string = "5";
  public type: string = "roksit";
  public topNumber: number = 10;
  public query: string;
  public must: ColumnTagInput[] = [];
  public mustnot: ColumnTagInput[] = [];
  public should: ColumnTagInput[] = [];
  public columns: ConfigItem = new ConfigItem();
  public visible: boolean = false;
  public system: boolean = false;
  public scheduledReport: ScheduledReport;

  public chartType: string;
  public config: Object;

  public getMaxTime() {
    let date = 0;
    if (this.dateInterval.indexOf("-") < 0) {
      date = new Date().getTime();
    } else {//custom date selected. Get the maximum time ..

    }
    return date;

  }

  public getMinTime() {
    let date = 0;

    if (this.dateInterval.indexOf("-") < 0) {
      date = new Date().getTime() - parseInt(this.dateInterval) * 60 * 1000;

    } else {//custom date selected. Get the maximum time ..

    }
    return date;
  }

}
