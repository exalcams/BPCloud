import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { CBPLocation, CBPBank, CBPIdentity, TaxPayerDetails, CBPIdentityView, CBPBankView, StateDetails, CBPFieldMaster, CBPDepartment } from 'app/models/vendor-master';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VendorMasterService {

  baseAddress: string;

  constructor(private _httpClient: HttpClient, private _authService: AuthService) {
    this.baseAddress = _authService.baseAddress;
  }

  // Error Handler
  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error || error.message || 'Server Error');
  }

  // Location
  GetLocationByPincode(Pincode: string): Observable<CBPLocation | string> {
    return this._httpClient.get<any>(`${this.baseAddress}vendormasterapi/Master/GetLocationByPincode?Pincode=${Pincode}`)
      .pipe(catchError(this.errorHandler));
  }
  GetAllDepartments(): Observable<CBPDepartment[] | string> {
    return this._httpClient.get<CBPDepartment[]>(`${this.baseAddress}vendormasterapi/Master/GetAllDepartments`)
      .pipe(catchError(this.errorHandler));
  }
  GetLocation(Pincode: string): Observable<any[]> {
    return this._httpClient.get<any>(`${this.baseAddress}vendormasterapi/Master/GetLocation?Pincode=${Pincode}`)
      .pipe(catchError(this.errorHandler));
  }
  SearchTaxPayer(GSTNumber: string): Observable<TaxPayerDetails | string> {
    return this._httpClient.get<TaxPayerDetails>(`${this.baseAddress}vendormasterapi/Master/SearchTaxPayer?GSTNumber=${GSTNumber}`)
      .pipe(catchError(this.errorHandler));
  }
  GetStateDetails(): Observable<StateDetails[] | string> {
    return this._httpClient.get<StateDetails[]>(`${this.baseAddress}vendormasterapi/Master/GetStateDetails`)
      .pipe(catchError(this.errorHandler));
  }

  GetBankByIFSC(IFSC: string): Observable<CBPBank | string> {
    return this._httpClient.get<CBPBank>(`${this.baseAddress}vendormasterapi/Master/GetBankByIFSC?IFSC=${IFSC}`)
      .pipe(catchError(this.errorHandler));
  }

  GetIdentityByType(IdentityType: string): Observable<CBPIdentity | string> {
    return this._httpClient.get<CBPIdentity>(`${this.baseAddress}vendormasterapi/Master/GetIdentityByType?IdentityType=${IdentityType}`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllIdentityTypes(): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}vendormasterapi/Master/GetAllIdentityTypes`)
      .pipe(catchError(this.errorHandler));
  }
  GetAllIdentityFields(): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}vendormasterapi/Master/GetAllIdentityFields`)
      .pipe(catchError(this.errorHandler));
  }
  ValidateIdentityByType(IdentityType: string, ID: string): Observable<CBPIdentity | string> {
    return this._httpClient.get<CBPIdentity>(`${this.baseAddress}vendormasterapi/Master/ValidateIdentityByType?IdentityType=${IdentityType}&ID=${ID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetTaxPayerDetails(Gstin: string): Observable<TaxPayerDetails | string> {
    return this._httpClient.get<TaxPayerDetails>(`${this.baseAddress}vendormasterapi/Master/GetTaxPayerDetails?Gstin=${Gstin}`)
      .pipe(catchError(this.errorHandler));
  }

  // Identity 

  GetAllIdentities(): Observable<CBPIdentityView[] | string> {
    return this._httpClient.get<CBPIdentityView[]>(`${this.baseAddress}vendormasterapi/Master/GetAllIdentities`)
      .pipe(catchError(this.errorHandler));
  }

  CreateIdentity(identity: CBPIdentityView): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}vendormasterapi/Master/CreateIdentity`,
      identity,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).pipe(catchError(this.errorHandler));
  }

  UpdateIdentity(identity: CBPIdentityView): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}vendormasterapi/Master/UpdateIdentity`,
      identity,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).pipe(catchError(this.errorHandler));
  }

  DeleteIdentity(identity: CBPIdentityView): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}vendormasterapi/Master/DeleteIdentity`,
      identity,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  // Bank 

  GetAllBanks(): Observable<CBPBankView[] | string> {
    return this._httpClient.get<CBPBankView[]>(`${this.baseAddress}vendormasterapi/Master/GetAllBanks`)
      .pipe(catchError(this.errorHandler));
  }

  CreateBank(bank: CBPBankView): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}vendormasterapi/Master/CreateBank`,
      bank,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).pipe(catchError(this.errorHandler));
  }

  UpdateBank(bank: CBPBankView): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}vendormasterapi/Master/UpdateBank`,
      bank,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).pipe(catchError(this.errorHandler));
  }

  DeleteBank(bank: CBPBankView): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}vendormasterapi/Master/DeleteBank`,
      bank,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  GetAllOnBoardingFieldMaster(): Observable<CBPFieldMaster[] | string> {
    return this._httpClient.get<CBPFieldMaster[]>(`${this.baseAddress}vendormasterapi/Master/GetAllOnBoardingFieldMaster`)
      .pipe(catchError(this.errorHandler));
  }
  UpdateOnBoardingFieldMaster(fieldMaster: CBPFieldMaster): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}vendormasterapi/Master/UpdateOnBoardingFieldMaster`,
      fieldMaster, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    })
      .pipe(catchError(this.errorHandler));
  }
}
