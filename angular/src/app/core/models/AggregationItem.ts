import {LogColumn} from "./LogColumn";
/**
 * Created by fatih on 03.08.2016.
 */


export class AggregationItem {
  public column: LogColumn;
  public label: string;

  public constructor(column: LogColumn, label: string) {
    this.column = column;
    this.label = label;
  }

}
