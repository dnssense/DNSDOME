import { CategoryV2 } from './CategoryV2';

export class ApplicationV2 {
    id: number;
    name: string;
    type: string;
    isVisible: number;
    domains: Domain[];
    categories: CategoryV2[];
}

export interface Domain {
    name: string;
}