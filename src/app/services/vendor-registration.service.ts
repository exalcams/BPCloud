import { Injectable } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { BPVendorOnBoarding, BPIdentity, BPBank, BPContact, BPActivityLog } from 'app/models/vendor-registration';

@Injectable({
  providedIn: 'root'
})
export class VendorRegistrationService {

  baseAddress: string;
  NotificationEvent: Subject<any>;

  GetNotification(): Observable<any> {
    return this.NotificationEvent.asObservable();
  }

  TriggerNotification(eventName: string): void {
    this.NotificationEvent.next(eventName);
  }

  constructor(private _httpClient: HttpClient, private _authService: AuthService) {
    this.baseAddress = _authService.baseAddress;
    this.NotificationEvent = new Subject();
  }

  // Error Handler
  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error || error.message || 'Server Error');
  }

  // VendorOnBoardings
  GetAllVendorOnBoardings(): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}api/VendorOnBoarding/GetAllVendorOnBoardings`)
      .pipe(catchError(this.errorHandler));
  }

  CreateVendorOnBoarding(VendorOnBoarding: BPVendorOnBoarding): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}api/VendorOnBoarding/CreateVendorOnBoarding`,
      VendorOnBoarding,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  UpdateVendorOnBoarding(VendorOnBoarding: BPVendorOnBoarding): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}api/VendorOnBoarding/UpdateVendorOnBoarding`,
      VendorOnBoarding,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  DeleteVendorOnBoarding(VendorOnBoarding: BPVendorOnBoarding): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}api/VendorOnBoarding/DeleteVendorOnBoarding`,
      VendorOnBoarding,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  GetIdentificationsByVOB(TransID: number): Observable<BPIdentity[] | string> {
    return this._httpClient.get<BPIdentity[]>(`${this.baseAddress}api/VendorOnBoarding/GetIdentificationsByVOB?TransID=${TransID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetBanksByVOB(TransID: number): Observable<BPBank[] | string> {
    return this._httpClient.get<BPBank[]>(`${this.baseAddress}api/VendorOnBoarding/GetBanksByVOB?TransID=${TransID}`)
      .pipe(catchError(this.errorHandler));
  }
 
  GetContactsByVOB(TransID: number): Observable<BPContact[] | string> {
    return this._httpClient.get<BPContact[]>(`${this.baseAddress}api/VendorOnBoarding/GetContactsByVOB?TransID=${TransID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetActivityLogsByVOB(TransID: number): Observable<BPActivityLog[] | string> {
    return this._httpClient.get<BPActivityLog[]>(`${this.baseAddress}api/VendorOnBoarding/GetActivityLogsByVOB?TransID=${TransID}`)
      .pipe(catchError(this.errorHandler));
  }
}
