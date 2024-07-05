import { Component, computed, effect, inject } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { AuthStatus } from './auth/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  public finishedAuthCheck = computed<boolean>(()=> {
    if (this.authService.authStatus() === AuthStatus.checking){
      return false;
    }
    return true;
  });

  public authStatusChangedEffect = effect(() => {
    console.log('authStatus', this.authService.authStatus());
    switch(this.authService.authStatus()){
      case AuthStatus.checking:
        break;
      case AuthStatus.notAuthenticated:
        this.router.navigateByUrl('/auth/login');
        return;
      case AuthStatus.authenticated:
        this.router.navigateByUrl('/dashboard');
        break;
    }
  });


}
