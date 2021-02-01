export class CommonClass {
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
}

export class CBPType extends CommonClass {
    Type: string;
    Language: string;
    Text: string;
}
export class CBPPostal extends CommonClass {
    PostalCode: string;
    Country: string;
    State: string;
    City: string;
    AddressLine1: string;
    AddressLine2: string;
}
export class CBPBank extends CommonClass {
    BankCode: string;
    BankName: string;
    BankCity: string;
    BankCountry: string;
    BankBranch: string;
}
export class CBPTitle extends CommonClass {
    Title: string;
    Language: string;
    TitleText: string;
}
export class CBPDepartment extends CommonClass {
    Department: string;
    Language: string;
    Text: string;
}
export class CBPApp extends CommonClass {
    ID: string;
    CCode: string;
    Type: string;
    Level: string;
    User: string;
    StartDate?: Date;
    EndDate?: Date;
}
export class CBPLocation extends CommonClass {
    Pincode: string;
    Location: string;
    Taluk: string;
    District: string;
    State: string;
    StateCode: string;
    Country: string;
    CountryCode: string;
}
export class CBPIdentity extends CommonClass {
    ID: number;
    Text: string;
    Format: string;
    DocReq: string;
    ExpDateReq: Date;
    Country: string;
}
export class CBPIdentityView extends CommonClass {
    ID: number;
    Text: string;
    Format: string;
    DocReq: string;
    ExpDateReq: Date;
    Country: string;
}
export class CBPBankView extends CommonClass {
    BankCode: string;
    BankName: string;
    BankCity: string;
    BankCountry: string;
    BankBranch: string;
}
export class TaxPayerDetails {
    gstin: string;
    tradeName: string;
    legalName: string;
    address1: string;
    address2: string;
    stateCode: string;
    pinCode: string;
    txpType: string;
    status: string;
    blkStatus: string;
}
export class StateDetails {
    State: string;
    StateCode: string;
}
export class CBPFieldMaster extends CommonClass {
    ID: number;
    Field: string;
    FieldName: string;
    Text: string;
    DefaultValue: string;
    Mandatory: boolean;
    Invisible: boolean;
}
export class CBPIdentityFieldMaster extends CommonClass {

    ID: number;
    Type: string;
    Text: string;
    RegexFormat: string;
    Mandatory: boolean;
    FileFormat: string;
    MaxSizeInKB: number;
}

export interface CBPIdentity extends CommonClass {
    
}