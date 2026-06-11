import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cor } from '../models/cor';

@Injectable({
  providedIn: 'root'
})
export class CorService {

  private readonly api = 'http://localhost:8080/cores';

  constructor(private httpClient: HttpClient) {}

  findAll(page?: number, pageSize?: number, nome?: string): Observable<Cor[]> {
    let params = new HttpParams();

    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page.toString());
      params = params.set('size', pageSize.toString());
    }

    if (nome) {
      params = params.set('nome', nome);
    }

    return this.httpClient.get<Cor[]>(this.api, { params });
  }

  findById(id: number | string): Observable<Cor> {
    return this.httpClient.get<Cor>(`${this.api}/${id}`);
  }

  create(cor: Cor): Observable<Cor> {
    return this.httpClient.post<Cor>(this.api, cor);
  }

  update(cor: Cor): Observable<Cor> {
    return this.httpClient.put<Cor>(`${this.api}/${cor.id}`, cor);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}