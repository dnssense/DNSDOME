import { DayProfileGroup } from './DayProfileGroup';

export class MobileCategory {
    id: number;
    categoryName: string;
    categoryNameTR: string;
    categoryNameEN: string;
    image: string;
    categoryType: number;
    subscriptionType: number;
    projectType: number;
    names: string[];
    ids: number[];
    blocked: boolean;
    profile: DayProfileGroup;
}
