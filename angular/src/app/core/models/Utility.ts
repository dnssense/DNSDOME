export class KeyValueModel<Key,Value> {
    key : Key;
    value : Value;
}

export enum TimeRangeEnum {
    lastYear = 1,
    last3Month,
    lastMonth,
    lastWeek,
    Today
}