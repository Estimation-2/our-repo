import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResourceloadService {

  constructor(private http: HttpClient) {}

  fetchData(): Observable<any> {
    return this.http.get('url/to/your/api');
  }

  saveData(data: any): Observable<any> {
    return this.http.post('url/to/your/save/api', data);
  }
}
