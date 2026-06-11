import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Modelo } from '../models/modelo';

@Injectable({
  providedIn: 'root'
})
export class ModeloService {

  private readonly api = 'http://localhost:8080/modelos';

  constructor(private httpClient: HttpClient) {}

  findAll(page?: number, pageSize?: number, nome?: string): Observable<Modelo[]> {
    let params = new HttpParams();

    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page.toString());
      params = params.set('size', pageSize.toString());
    }

    if (nome) {
      params = params.set('nome', nome);
    }

    return this.httpClient.get<Modelo[]>(this.api, { params });
  }

  findById(id: number | string): Observable<Modelo> {
    return this.httpClient.get<Modelo>(`${this.api}/${id}`);
  }

  findByNome(nome: string): Observable<Modelo[]> {
  return this.httpClient.get<Modelo[]>(`${this.api}/nome/${nome}`);
}

  create(modelo: Modelo): Observable<Modelo> {
    return this.httpClient.post<Modelo>(this.api, modelo);
  }

  update(modelo: Modelo): Observable<Modelo> {
    return this.httpClient.put<Modelo>(`${this.api}/${modelo.id}`, modelo);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}