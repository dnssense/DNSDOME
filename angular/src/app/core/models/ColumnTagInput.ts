/**
 * Created by fatih on 10.08.2016.
 */
export class ColumnTagInput {

  id: number;
  field: string;
  operator: string;
  value: string;

  constructor(field: string, operator: string, value: string) {
    this.field = field;
    this.operator = operator;
    this.value = value;
    this.id = new Date().getTime();
  }

  public toString() {
    return '' + this.field + this.operator + this.value;
  }
}
