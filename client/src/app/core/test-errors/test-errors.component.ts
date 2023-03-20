import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-test-errors',
  templateUrl: './test-errors.component.html',
  styleUrls: ['./test-errors.component.scss'],
})
export class TestErrorsComponent {
  baseUrl = environment.apiUrl;
  validationErrors: string[] = [];

  constructor(private http: HttpClient) {}

  get404Error() {
    return this.http.get(this.baseUrl + 'products/42').subscribe({
      next: (response) => console.log(response),
      error: (error) => console.log(error),
    });
  }

  get500Error() {
    return this.http.get(this.baseUrl + 'buggy/servererror').subscribe({
      next: (response) => console.log(response),
      error: (error) => console.log(error),
    });
  }

  get400Error() {
    return this.http.get(this.baseUrl + 'buggy/badrequest').subscribe({
      next: (response) => console.log(response),
      error: (error) => console.log(error),
    });
  }

  get400ValidationError() {
    return this.http.get(this.baseUrl + 'products/one').subscribe({
      next: (response) => console.log(response),
      error: (error) => {
        console.log(error.errors);
        this.validationErrors = error.errors;
      },
    });
  }
}
