import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Guid } from 'guid-typescript';
import { ChangePassword, ForgotPassword, EMailModel, LoginModel, SessionMaster } from 'app/models/master';
import { environment } from 'environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseAddress: string;
  questionnaireBaseAddress: string;
  clientId: string;
  constructor(private _httpClient: HttpClient) {
    this.baseAddress = environment.baseAddress;
    // this.questionnaireBaseAddress = environment.questionnaireBaseAddress;
    this.clientId = environment.clientId;
  }

  // Error Handler

  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error.error_description || error.error || error.message || 'Server Error');
  }

  errorHandler1(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error || error.message || 'Server Error');
  }

  login(userName: string, password: string): Observable<any> {
    // tslint:disable-next-line:prefer-const
    // let data = `grant_type=password&username=${userName}&password=${password}&client_id=${this.clientId}`;
    const loginModel: LoginModel = {
      UserName: userName,
      Password: password,
      clientId: this.clientId
    };
    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Auth/token`, loginModel,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }

  GetIPAddress(): Observable<any> {
    return this._httpClient
      .get<any>('https://freegeoip.net/json/?callback').pipe(
        map(response => response || {}),
        catchError(this.errorHandler1)
      );
  }

  GetSessionMasterByProject( ProjectName: string): Observable<SessionMaster | string> {
    return this._httpClient
        .get<SessionMaster>(
            `${this.baseAddress}authenticationapi/Master/GetSessionMasterByProject?ProjectName=${ProjectName}`
        )
        .pipe(catchError(this.errorHandler1));
}
  SignOut(UserID: Guid): Observable<any> {
    return this._httpClient.get<any>(`${this.baseAddress}authenticationapi/Master/SignOut?UserID=${UserID}`,
    ).pipe(catchError(this.errorHandler1));
  }

  ChangePassword(changePassword: ChangePassword): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/ChangePassword`,
      changePassword,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler1));
  }

  ForgotPassword(forgotPassword: ForgotPassword): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/ForgotPassword`,
      forgotPassword,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler1));
  }

  SendResetLinkToMail(eMailModelmail: EMailModel): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/SendResetLinkToMail`,
      eMailModelmail,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler1));
  }
}
