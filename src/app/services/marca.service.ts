import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Marca } from '../models/marca';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {

  private readonly api = 'http://localhost:8080/marcas';

  constructor(private httpClient: HttpClient) {}

  findAll(page?: number, pageSize?: number, nome?: string): Observable<Marca[]> {
    let params = new HttpParams();

    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page.toString());
      params = params.set('size', pageSize.toString());
    }

    if (nome) {
      params = params.set('nome', nome);
    }

    return this.httpClient.get<Marca[]>(this.api, { params });
  }

  findById(id: number): Observable<Marca> {
    return this.httpClient.get<Marca>(`${this.api}/${id}`);
  }

  create(marca: Marca): Observable<Marca> {
    return this.httpClient.post<Marca>(this.api, marca);
  }

  update(marca: Marca): Observable<Marca> {
    return this.httpClient.put<Marca>(`${this.api}/${marca.id}`, marca);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}