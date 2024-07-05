import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { AuthStatus, CheckTokenResponse, LoginResponse, User } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl: string = environment.baseUrl;
  private httpClient = inject(HttpClient);

  private _currentUser = signal<User|null>(null);
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);
  public currentUser = computed(() => this._currentUser());
  public authStatus = computed(() => this._authStatus())

  constructor() {
    console.log('constructor authservice');
    this.checkAuthStatus().subscribe();
  }

  private setAuthentication(user: User, token: string): boolean {
    this._currentUser.set(user);
    this._authStatus.set(AuthStatus.authenticated);
    localStorage.setItem('token', token);
    console.log('setting autheticated to true', token);
    return true;
  }

  login(email:string, password: string): Observable<boolean>{
    const url = `${this.baseUrl}/auth/login`;
    const body = {email, password};
    return this.httpClient.post<LoginResponse>(url, body)
                   .pipe(
                      map(({user, token}) => this.setAuthentication(user, token)),
                      catchError((error) =>  throwError(() => error.error.message))
                   );
  }

  checkAuthStatus(): Observable<boolean>{
    const url = `${this.baseUrl}/auth/check-token`;
    const token = localStorage.getItem('token');
    if (!token) {
      this._authStatus.set(AuthStatus.notAuthenticated);
      return of(false);
    }

    const headers = new HttpHeaders()
                          .set('Authorization', `Bearer ${token}`);

    return this.httpClient.get<CheckTokenResponse>(url, { headers })
                   .pipe(
                      map(({user, token}) => this.setAuthentication(user, token)),
                      catchError(() => {
                        this._authStatus.set(AuthStatus.notAuthenticated);
                        return of(false);
                      })
                   );
  }

  logout(){
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.notAuthenticated);
    localStorage.removeItem('token');
  }
}
