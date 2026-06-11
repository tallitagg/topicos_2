import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoTampa } from '../models/tipo-tampa';

@Injectable({
  providedIn: 'root'
})
export class TipoTampaService {

  private readonly api = 'http://localhost:8080/tipoTampas';

  constructor(private httpClient: HttpClient) {}

  findAll(page?: number, pageSize?: number): Observable<TipoTampa[]> {
    let params = new HttpParams();

    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page.toString());
      params = params.set('size', pageSize.toString());
    }

    return this.httpClient.get<TipoTampa[]>(this.api, { params });
  }

  findById(id: number | string): Observable<TipoTampa> {
    return this.httpClient.get<TipoTampa>(`${this.api}/${id}`);
  }
}