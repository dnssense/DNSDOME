
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

export class Category {
    id: number;
    isBlocked: boolean;
    // timeProfile: TimeProfile;
}
const FIRSTLY_SEEN = 62;
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
    get isPositiveSecurity(): boolean {

        const firstlyseen = this.domainProfile.categories.find(x => x.id == FIRSTLY_SEEN);
        if (firstlyseen && firstlyseen.isBlocked) {return true; }
        return false;
    }
    set isPositiveSecurity(value: boolean)  {
        let firstlyseen = this.domainProfile.categories.find(x => x.id == FIRSTLY_SEEN);
        if (!firstlyseen) {
        this.domainProfile.categories.push({id: 62, isBlocked: false});
        }
        firstlyseen = this.domainProfile.categories.find(x => x.id == FIRSTLY_SEEN);
        firstlyseen.isBlocked = value;

    }
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
