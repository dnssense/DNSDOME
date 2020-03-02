export class KeyValueModel<Key, Value> {
    key: Key;
    value: Value;
}

export enum TimeRangeEnum {
    lastHour = 1,
    last3Days,
    lastMonth,
    lastWeek,
    Today
}

export enum PageEnum {
    monitor = 1,
    customerReports = 2
}
