import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Material } from '../models/material';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {

  private readonly api = 'http://localhost:8080/materiais';

  constructor(private httpClient: HttpClient) { }

  findAll(page?: number, pageSize?: number): Observable<Material[]> {
    let params = new HttpParams();

    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page.toString());
      params = params.set('size', pageSize.toString());
    }

    return this.httpClient.get<Material[]>(this.api, { params });
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.api}/count`);
  }

  findById(id: number | string): Observable<Material> {
    return this.httpClient.get<Material>(`${this.api}/${id}`);
  }

  findByTipo(tipo: string): Observable<Material[]> {
  return this.httpClient.get<Material[]>(`${this.api}/tipo/${tipo}`);
}

  create(material: Material): Observable<Material> {
    return this.httpClient.post<Material>(this.api, material);
  }

  update(material: Material): Observable<Material> {
    return this.httpClient.put<Material>(`${this.api}/${material.id}`, material);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }

}