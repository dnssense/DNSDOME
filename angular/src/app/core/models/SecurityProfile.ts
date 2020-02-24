
export class BlackWhiteListProfile {
    id: number;
    blackList: ListItem[] = [];
    whiteList: ListItem[] = [];
}

export class ListItem {
    domain: string;
    comment: string;
}

export class SecurityProfileItem {
    id: number;
    categories: Category[] = [];
}

export interface Category {
    id: number;
    isBlocked: boolean;
    // timeProfile: TimeProfile;
}
export class SecurityProfile {
    id: number;
    name: string;
    isSafeSearchEnabled = false;
    isYoutubeStrictModeEnabled = false;
    domainProfile: SecurityProfileItem = new SecurityProfileItem();
    applicationProfile: SecurityProfileItem = new SecurityProfileItem();
    blackWhiteListProfile: BlackWhiteListProfile = new BlackWhiteListProfile();
    numberOfUsage: number;
    isSystem = false;
}


// TODO: bilahare eklenecek
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
