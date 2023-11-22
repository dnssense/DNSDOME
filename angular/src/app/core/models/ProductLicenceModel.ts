import {
  CompanyLicenceUIResponse,
  LicencePageUIRequest, LicencePageUIResponse,
  LicencePageUpdateUIRequest,
  LicencePageUpdateUIResponse, LicenceProductCode, LicenceRequestType, LicenceTypeCode,
  LicenceTypeItem,
  ProductTypeItem, UpdateLicenceUIRequest, UpdateLicenceUIResponse,
} from 'roksit-lib';


export class LicencePageServiceRequest {
  licenceTypeCode: LicenceTypeCode;
  productCode: LicenceProductCode;
  requestType: LicenceRequestType;
}
export class LicencePageServiceResponse {
  results: {
    validEmailDomains: string[];
    fullName: string;
    companyEmailAddress: string;
    accountManagerEmailAddress: string;
    phoneCountryCode: string;
    phoneNumber: string;
    requestAlreadyReceived: boolean;
  };
}
export class LicencePageUpdateServiceRequest extends LicencePageServiceRequest {
  fullName: string;
  companyEmailAddress: string;
  accountManagerEmailAddress: string;
  phoneCountryCode: string;
  phoneNumber: string;
}
export class LicencePageUpdateServiceResponse {
  status: number;
}
export class CompanyLicenceServiceResponse {
  status: number;
  message: string;
  results: {
    companyId: number;
    id: number;
    product: ProductTypeServiceItem;
    licenceType: LicenceTypeServiceItem;
    expiration: Date;
    option: Map<string, any>;
    userCount: number;
  };
}
export class LicenceTypeServiceItem {
  id: 2;
  name: string;
  description: string;
  code: LicenceTypeCode;
}
export class ProductTypeServiceItem {
  id: 2;
  name: string;
  description: string;
  code: LicenceProductCode;
  licenceTypes: LicenceTypeServiceItem[];
}

function mapLicenceTypeFromServiceToUI(json: LicenceTypeServiceItem): LicenceTypeItem {
  return {
    id: json.id,
    name: json.name,
    description: json.description,
    code: json.code
  };
}

function mapProductTypeFromServiceToUI(json: ProductTypeServiceItem): ProductTypeItem {
  const product =  {
    id: json.id,
    name: json.name,
    description: json.description,
    code: json.code,
    licenceTypes: []
  };
  json.licenceTypes?.forEach(lt => {
    product.licenceTypes.push(mapLicenceTypeFromServiceToUI(lt));
  });
  return product;
}

export function mapCompanyLicenceServiceResponseToUI(json: CompanyLicenceServiceResponse): CompanyLicenceUIResponse {
  return  {
    status: json.status,
    message: json.message,
    results: json.results ? {
      companyId: json.results.companyId,
      id: json.results.id,
      product: json.results.product ? mapProductTypeFromServiceToUI(json.results.product) : null,
      licenceType: json.results.licenceType ? mapLicenceTypeFromServiceToUI(json.results.licenceType) : null,
      expiration: json.results.expiration,
      option: json.results.option,
      userCount: json.results.userCount
    } : null
  };
}

export function mapLicencePageServiceResponseToUI(json: LicencePageServiceResponse): LicencePageUIResponse {
  return  {
    results: json.results ? {
      validEmailDomains: json.results.validEmailDomains,
      fullName: json.results.fullName,
      companyEmailAddress: json.results.companyEmailAddress,
      accountManagerEmailAddress: json.results.accountManagerEmailAddress,
      phoneCountryCode: json.results.phoneCountryCode,
      phoneNumber: json.results.phoneNumber,
      requestAlreadyReceived: json.results.requestAlreadyReceived
    } : null
  };
}

export function mapLicencePageUpdateServiceResponseToUI(json: LicencePageUpdateServiceResponse): LicencePageUpdateUIResponse {
  return  {
      status: json.status
    };
}

export function mapLicencePageUIRequestToService(model: LicencePageUIRequest): LicencePageServiceRequest {
  return  {
    licenceTypeCode: model.licenceTypeCode,
    productCode: model.productCode,
    requestType: model.requestType,
  };
}

export function mapLicencePageUpdateUIRequestToService(model: LicencePageUpdateUIRequest): LicencePageUpdateServiceRequest {
  return  {
    ...mapLicencePageUIRequestToService(model),
    fullName: model.fullName,
    companyEmailAddress: model.companyEmailAddress,
    accountManagerEmailAddress: model.accountManagerEmailAddress,
    phoneCountryCode: model.phoneCountryCode,
    phoneNumber: model.phoneNumber
  };
}
export class UpdateLicenceServiceRequest {
  id: number;
  companyId: number;
  product: {id: number};
  licenceType?: {id: number};
  option: Map<string, any>;
}

export function mapUpdateLicenceUIRequestToService(ui: UpdateLicenceUIRequest): UpdateLicenceServiceRequest {
  return {
    id: ui.id,
    companyId: ui.companyId,
    product: {id: ui.productId},
    licenceType: {id: ui.licenceTypeId},
    option: ui.option
  };
}
export class UpdateLicenceServiceResponse {
  status: number;
}
export function mapUpdateLicenceServiceResponseToUI(json: UpdateLicenceServiceResponse): UpdateLicenceUIResponse {
  return {
    status: json.status
  };
}
