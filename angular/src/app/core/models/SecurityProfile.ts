
export class SecurityProfile {
    id: number
    name: string
    isSafeSearchEnabled: boolean
    isYoutubeStrictModeEnabled: boolean
    domainProfile: SecurityProfileItem
    applicationProfile: SecurityProfileItem
    blackWhiteListProfile: BlackWhiteListProfile
}

export interface BlackWhiteListProfile {
    id: number
    blackList: string[]
    whiteList: string[]
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