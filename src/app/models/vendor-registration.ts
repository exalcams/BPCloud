import { Guid } from 'guid-typescript';

export class CommonClass {
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
}

export class BPVendorOnBoarding extends CommonClass {
    TransID: number;
    Name: string;
    Role: string;
    LegalName: number;
    AddressLine1: string;
    AddressLine2: string;
    City: number;
    State: string;
    Country: string;
    PinCode: string;
    Type: string;
    TypeofIndustry:string;
    Token: string;
    Plant:string;
    Phone1: string;
    Phone2: number;
    Email1: string;
    Email2: string;
    Invoice: string;
    GSTNumber: string;
    GSTStatus:string;
    PANNumber: string
    AccountGroup:string;
    CompanyCode:string;
    PurchaseOrg:string;
    MSME_TYPE:string;
    Department:string;
    EmamiContactPerson:string;
    EmamiContactPersonMail:string;

    WebsiteAddress: string;
    VendorCode: number;
    ParentVendor: string;
    Status: string;
    Field1: string;
    Field2: string;
    Field3: string;
    Field4: string;
    Field5: string;
    Field6: string;
    Field7: string;
    Field8: string;
    Field9: string;
    Field10: string;
    Remarkss: string;
}
export class BPIdentity extends CommonClass {
    TransID: number;
    Type: string;
    IDNumber: string;
    ValidUntil?: Date;
    DocID: string;
    AttachmentName: string;
    BPAttachment: any;
    IsValid: boolean;
    Option: any;
}
export class BPBank extends CommonClass {
    TransID: number;
    AccountNo: string;
    Name: string;
    IFSC: string;
    BankName: string;
    Branch: string;
    City: string;
    DocID: string;
    AttachmentName: string;
    BPAttachment: any;
    IsValid: boolean;
}
export class BPContact extends CommonClass {
    TransID: number;
    Item: string;
    Name: string;
    Department: string;
    Title: string;
    Mobile: string;
    Email: string;
}
export class BPActivityLog extends CommonClass {
    TransID: number;
    LogID: number;
    Type: string;
    Activity: string;
    Text: string;
    Date?: Date;
    Time: string;
}
export class BPText extends CommonClass {
    TextID: number;
    Text: string;
}

export class BPVendorOnBoardingView extends CommonClass {
    TransID: number;
    Name: string;
    Role: string;
    LegalName: number;
    AddressLine1: string;
    AddressLine2: string;
    Token: string;
    Plant:string;
    City: number;
    State: string;
    Country: string;
    PinCode: string;
    GSTNumber: string;
    GSTStatus:string;
    PANNumber: string;
    AccountGroup:string;
    CompanyCode:string;
    PurchaseOrg:string;
    Department:string;
    MSME_TYPE:string;
    TypeofIndustry:string;
    EmamiContactPerson:string;
    EmamiContactPersonMail:string;
    Type: string;
    Phone1: string;
    Phone2: number;
    Email1: string;
    Email2: string;
    Invoice: string;
    WebsiteAddress: string;
    VendorCode: number;
    ParentVendor: string;
    Status: string;
    Field1: string;
    Field2: string;
    Field3: string;
    Field4: string;
    Field5: string;
    Field6: string;
    Field7: string;
    Field8: string;
    Field9: string;
    Field10: string;

    bPIdentities: BPIdentity[];
    bPBanks: BPBank[];
    bPContacts: BPContact[];
    bPActivityLogs: BPActivityLog[];
    // QuestionAnswers: Answers[];
    Remarkss: string;
}
export class Questionnaires {
    QRID: number;
    QRText: string;
    IsInActive: string;
}
export class QuestionnaireGroup {
    QRGID: number;
    QRID: number;
    Language: string;
    QRGText: string;
    QRGLText: string;
    QRGSortPriority: string;
    DefaultExpanded: string;
}
export class QuestionnaireGroupQuestion {
    QRID: number;
    QRGID: number;
    QID: number;
    IsMandatory: boolean;
    SortPriority: number;
}
export class Question {
    QID: number;
    Language: string;
    QText: string;
    QLText: string;
    QAnsType: string;
}
export class QAnswerChoice {
    ChoiceID: number;
    QID: number;
    Language: string;
    ChoiceText: string;
    IsDefault: boolean;
}

export class Answers {
    AppID: number;
    AppUID: number;
    QRID: number;
    QID: number;
    Answer: string;
    AnsweredBy: Guid;
    AnswredOn: Date;
}
export class QuestionnaireResultSet {
    QRID: number;
    Questionnaire: Questionnaires[];
    QuestionnaireGroup: QuestionnaireGroup[];
    QuestionnaireGroupQuestion: QuestionnaireGroupQuestion[];
    Questions: Question[];
    QuestionAnswerChoices: QAnswerChoice[];
    Answers: Answers[];
}

export class QuestionAnswersView {
    QRID: number;
    QRText: string;
    QRGID: number;
    QRGText: string;
    QID: number;
    Language: string;
    QText: string;
    QLText: string;
    QAnsType: string;
    AppID: number;
    AppUID: number;
    Answer: string;
    AnsweredBy: string;
    AnswredOn: Date | string;
    AnswerChoice: QAnswerChoiceView[];
}

export class QAnswerChoiceView {
    ChoiceID: number;
    QID: number;
    Language: string;
    ChoiceText: string;
    IsDefault: boolean;
}
export class VendorTokenCheck {
    transID: number;
    emailAddress: string;
    token: string;
    isValid: boolean;
    message: string;
}
export class AnswerList {
    constructor() {
        this.Answerss = [];
    }
    Answerss: Answers[];
}
