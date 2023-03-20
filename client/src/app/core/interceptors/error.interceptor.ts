import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((errorResponse: HttpErrorResponse) => {
        if (errorResponse) {
          if (errorResponse.status === 400) {
            if (errorResponse.error.errors) {
              throw errorResponse.error;
            } else {
              this.toastr.error(
                errorResponse.error.message,
                errorResponse.status.toString()
              );
            }
          }

          if (errorResponse.status === 401) {
            this.router.navigateByUrl('/not-found');
            this.toastr.error(
              errorResponse.error.message,
              errorResponse.status.toString()
            );
          }

          if (errorResponse.status === 500) {
            const navigationExtras: NavigationExtras = {
              state: { error: errorResponse.error },
            };
            this.router.navigateByUrl('/server-error', navigationExtras);
          }
        }
        return throwError(() => new Error(errorResponse.message));
      })
    );
  }
}
