
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
export const FIRSTLY_SEEN = 62;
export const DOH_BYPASS = 70;
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
    isPositiveSecurity = false;
    // burasi boyle yazildiginda calismiyor neden anlamadim
    /* get isPositiveSecurity(): boolean {

        const firstlyseen = this.domainProfile.categories.find(x => x.id == FIRSTLY_SEEN);
        console.log(`${firstlyseen ? 'found' : 'notfound'} , ${firstlyseen ? firstlyseen.isBlocked : 'not known'}`);
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

    } */
}



