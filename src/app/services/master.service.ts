import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { MenuApp, RoleWithApp, UserWithRole, UserNotification, Reason, UserView, VendorUser } from 'app/models/master';
import { Guid } from 'guid-typescript';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

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

  // App
  CreateMenuApp(menuApp: MenuApp): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/CreateApp`,
      menuApp,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  GetAllMenuApp(): Observable<MenuApp[] | string> {
    return this._httpClient.get<MenuApp[]>(`${this.baseAddress}authenticationapi/Master/GetAllApps`)
      .pipe(catchError(this.errorHandler));
  }

  UpdateMenuApp(menuApp: MenuApp): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/UpdateApp`,
      menuApp,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  DeleteMenuApp(menuApp: MenuApp): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/DeleteApp`,
      menuApp,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  // Reason
  CreateReason(reason: Reason): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/CreateReason`,
      reason,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  GetAllReasons(): Observable<Reason[] | string> {
    return this._httpClient.get<Reason[]>(`${this.baseAddress}authenticationapi/Master/GetAllReasons`)
      .pipe(catchError(this.errorHandler));
  }

  UpdateReason(reason: Reason): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/UpdateReason`,
      reason,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  DeleteReason(reason: Reason): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/DeleteReason`,
      reason,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  // Role
  CreateRole(role: RoleWithApp): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/CreateRole`,
      role,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  GetAllRoles(): Observable<RoleWithApp[] | string> {
    return this._httpClient.get<RoleWithApp[]>(`${this.baseAddress}authenticationapi/Master/GetAllRoles`)
      .pipe(catchError(this.errorHandler));
  }

  UpdateRole(role: RoleWithApp): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/UpdateRole`,
      role,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  DeleteRole(role: RoleWithApp): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/DeleteRole`,
      role,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  // Users

  CreateUser1(user: UserWithRole, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('uploadFile', file, file.name);
    formData.append('userName', user.UserName);

    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/CreateUser1`,
      formData,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    )
      .pipe(catchError(this.errorHandler));
  }

  CreateUser(user: UserWithRole): Observable<any> {

    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/CreateUser`,
      user,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));

  }
  CreateVendorUser(vendorUser: VendorUser): Observable<UserWithRole | string> {

    return this._httpClient.post<UserWithRole>(`${this.baseAddress}authenticationapi/Master/CreateVendorUser`,
      vendorUser,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));

  }

  GetAllUsers(): Observable<UserWithRole[] | string> {
    return this._httpClient.get<UserWithRole[]>(`${this.baseAddress}authenticationapi/Master/GetAllUsers`)
      .pipe(catchError(this.errorHandler));
  }
  GetApproverPlants(Id:Guid): Observable<string[] | string> {
    return this._httpClient.get<string[]>(`${this.baseAddress}authenticationapi/Master/GetApproverPlants?UserID=${Id}`)
      .pipe(catchError(this.errorHandler));
  }
  
  GetAllDevelopers(): Observable<UserView[] | string> {
    return this._httpClient.get<UserView[]>(`${this.baseAddress}authenticationapi/Master/GetAllDevelopers`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllDevelopersAndTLs(): Observable<UserView[] | string> {
    return this._httpClient.get<UserView[]>(`${this.baseAddress}authenticationapi/Master/GetAllDevelopersAndTLs`)
      .pipe(catchError(this.errorHandler));
  }

  UpdateUser(user: UserWithRole): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/UpdateUser`,
      user,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));

  }

  DeleteUser(user: UserWithRole): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/DeleteUser`,
      user,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  GetAllNotificationByUserID(UserID: string): Observable<UserNotification[] | string> {
    return this._httpClient.get<UserNotification[]>(`${this.baseAddress}authenticationapi/Notification/GetAllNotificationByUserID?UserID=${UserID}`)
      .pipe(catchError(this.errorHandler));
  }

  UpdateNotification(SelectedNotification: UserNotification): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Notification/UpdateNotification`,
      SelectedNotification, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    })
      .pipe(catchError(this.errorHandler));
  }

}
