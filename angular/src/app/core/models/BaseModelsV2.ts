import {
    BaseFilterUIRequestModel,
    BaseUIResponseModel,
    RangeType,
    FilterBadgeModelV2,
    FilterBadgeValueV2,
    BaseFilterInput,
    TrafficColumnNames,
    FirstlyVisitedByOption,
    FilterContants
} from 'roksit-lib';


export interface BaseFilterRequestServiceModel {
    range?: {
        gte?: number,
        lt?: number
    };
    must?: BaseServiceFilterModel[] ;
    must_not?: BaseServiceFilterModel[];
    sort?: {
        sort_by: string,
        asc?: boolean,
    };
    page?: {
        page: number,
        size: number
    };
    between_queries?: BaseServiceRangeModel[];
}

export interface InputFieldMapping {
    key: string;
    value: string;
}

export function mapBaseFilterRequestUiFieldsToServiceFields(filter: BaseFilterInput, mappingPairs: Map<string, string>): BaseFilterInput {
    if (mappingPairs) {
        const filterTransformed = {
            ...filter,
            filterList: []
        } as BaseFilterInput;
        filter?.filterList?.forEach((i: FilterBadgeModelV2) => {
            const iCopy = {...i};
            if (mappingPairs.get(iCopy.name)) {
                iCopy.name = mappingPairs.get(iCopy.name);
            }
            iCopy.values = [];
            i?.values?.forEach((v: FilterBadgeValueV2) => {
                const vCopy = {...v};

                iCopy.values.push(vCopy);
            });
            filterTransformed.filterList.push(iCopy);
        });
        return filterTransformed;
    }
    return filter;
}

interface BaseServiceRangeModel {
    name: string;
    gte?: number;
    lt?: number;
}

interface BaseServiceFilterModel {
    name: string;
    value: string[];
}

export interface BaseResponseServiceModel<T> {
    results: T | T[];
    total_count?: number;
}

export function mapBaseServiceModelToUIModel<T, K>(mapper: (arg: K) => T, json: BaseResponseServiceModel<K>): BaseUIResponseModel<T> {
    const uiModel = {} as BaseUIResponseModel<T>;
    if (json.results) {
        if (json.results instanceof Array) {
            const list = [];
            json.results.forEach((item) => {
                list.push(mapper(item));
            });
            if (list)
                uiModel.results = list;
        } else {
            uiModel.results = mapper(json.results);
        }

    }
    if (json.total_count)
        uiModel.total_count = json.total_count;
    return uiModel;
}

function handleCustomFvFilter(i: FilterBadgeModelV2, serviceModel: BaseFilterRequestServiceModel) {
    i.values?.forEach((v: FilterBadgeValueV2) => {
        let filterItem: BaseServiceFilterModel;
        if (v.value === FirstlyVisitedByOption.Company) {
            filterItem = {name: TrafficColumnNames.FVCompany} as BaseServiceFilterModel;
        } else if (v.value === FirstlyVisitedByOption.Network) {
            filterItem = {name: TrafficColumnNames.FVNetwork} as BaseServiceFilterModel;
        } else if (v.value === FirstlyVisitedByOption.Host) {
            filterItem = {name: TrafficColumnNames.FVHost} as BaseServiceFilterModel;
        } else {
            return;
        }
        filterItem.value = [];
        filterItem.value.push('true');
        if (i.equal) {
            serviceModel.must.push(filterItem);
        } else {
            serviceModel.must_not.push(filterItem);
        }
    });
}


function mapUICriteriaToServiceModel(i, serviceModel: BaseFilterRequestServiceModel, mapper?: (arg: string) => string) {
    const filterItem = {name: i.name} as BaseServiceFilterModel;
    filterItem.value = [];
    i.values?.forEach((v: FilterBadgeValueV2) => {
        filterItem.value.push(mapper ? mapper((v.value !== null && v.value !== undefined) ? v.value : 'N/A') : (v.value !== null && v.value !== undefined) ? v.value : 'N/A');
    });
    if (i.equal) {
        serviceModel.must.push(filterItem);
    } else {
        serviceModel.must_not.push(filterItem);
    }
}

export function mapBaseUIFilterRequestToServiceModel (uiModel: BaseFilterUIRequestModel): BaseFilterRequestServiceModel {
    const serviceModel = {} as BaseFilterRequestServiceModel;
    if (uiModel.filter) {
        serviceModel.must = [];
        serviceModel.must_not = [];
        uiModel.filter?.filterList?.forEach((i: FilterBadgeModelV2) => {
            if (i.disableBySystem || i.disableByUser) {
                return;
            }
            if (i.name === FilterContants.IS_FV) {
                handleCustomFvFilter(i, serviceModel);
            } else if (i.name === TrafficColumnNames.MacAddress) {
                mapUICriteriaToServiceModel(i, serviceModel, mapUIMacAddressToService);
            } else {
                mapUICriteriaToServiceModel(i, serviceModel);
            }
        });
        serviceModel.range = {};
        serviceModel.range.gte = uiModel.filter?.gte;
        serviceModel.range.lt = uiModel.filter?.lt;
    }
    if (uiModel.between_queries) {
        serviceModel.between_queries = [];
        uiModel.between_queries.forEach(rangeF => {
            const item = {name: rangeF.name} as BaseServiceRangeModel;
            if (rangeF.range.type === RangeType.LessThan) {
                item.lt = rangeF.range.value1;
            } else if (rangeF.range.type === RangeType.GraterThan) {
                item.gte = rangeF.range.value1;
            } else if (rangeF.range.type === RangeType.Between) {
                item.gte = rangeF.range.value1;
                item.lt = rangeF.range.value2;
            }
            serviceModel.between_queries.push(item);
        });
    }
    if (uiModel.sort) {
        serviceModel.sort = {
            sort_by: uiModel.sort.sort_by
        };
        serviceModel.sort.asc = uiModel.sort.asc;
    }
    if (uiModel.page) {
        serviceModel.page = {
            page: uiModel.page.page + 1,
            size: uiModel.page.size
        };
    }
    return serviceModel;
}

export function mapServiceMacAddressToUI(macAddress: string): string {
    const alphaNum = /^[A-Za-z0-9]+$/;
    if (macAddress?.length === 12 && alphaNum.test(macAddress)) {
        return macAddress.replace(/(.{2})/g, '$1:').slice(0 , -1);
    }
    return macAddress;
}

function mapUIMacAddressToService(macAddress: string): string {
    return macAddress?.replace(/:/g, '');
}
