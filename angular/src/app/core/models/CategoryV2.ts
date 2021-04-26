export class CategoryV2 {
    id: number;
    name: string;
    type: string;
    isVisible = 0;
    group: string;

    /**
     * For UI
     */
    selected: boolean;
}
