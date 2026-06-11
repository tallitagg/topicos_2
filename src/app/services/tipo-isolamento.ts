import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoIsolamento } from '../models/tipo-isolamento';

@Injectable({
  providedIn: 'root'
})
export class TipoIsolamentoService {

  private readonly api = 'http://localhost:8080/tipoIsolamentos';

  constructor(private httpClient: HttpClient) {}

  findAll(page?: number, pageSize?: number): Observable<TipoIsolamento[]> {
    let params = new HttpParams();

    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page.toString());
      params = params.set('size', pageSize.toString());
    }

    return this.httpClient.get<TipoIsolamento[]>(this.api, { params });
  }

  findById(id: number | string): Observable<TipoIsolamento> {
    return this.httpClient.get<TipoIsolamento>(`${this.api}/${id}`);
  }
}