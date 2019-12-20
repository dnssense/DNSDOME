
export class SecurityProfile {
    id: number;
    name: string;
    isSafeSearchEnabled: boolean = false;
    isYoutubeStrictModeEnabled: boolean = false;
    domainProfile: SecurityProfileItem;
    applicationProfile: SecurityProfileItem;
    blackWhiteListProfile: BlackWhiteListProfile;
    numberOfUsage: number;
    isSystem: boolean=false;

}

export interface BlackWhiteListProfile {
    id: number
    blackList: ListItem[]
    whiteList: ListItem[]
}

export class ListItem {
    domain: string;
    comment: string;
  }

export interface SecurityProfileItem {
    id: number
    categories: Category[]
}

export interface Category {
    id: number;
    isBlocked: boolean;
    //timeProfile: TimeProfile;
}

//TODO: bilahare eklenecek
// export interface TimeProfile {
//     id: number
//     name: string
//     dayTimeRanges: DayTimeRange[];
// }

// export interface DayTimeRange {
//     dayNo: number;
//     startDate: number;
//     endDate: number;
// }