import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JSONService {
  private baseUrl: string = 'https://raw.githubusercontent.com/kemalersin/gfn-crawler/main/games.json';

  constructor(private httpClient: HttpClient) {}

  public getJSONData(): Observable<any> {
    return this.httpClient.get(this.baseUrl);
  }
}
