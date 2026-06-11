import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Produto } from '../models/produto';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  private readonly api = 'http://localhost:8080/produtos';

  constructor(private httpClient: HttpClient) {}

  findAll(page?: number, pageSize?: number, nome?: string): Observable<Produto[]> {
    let params = new HttpParams();

    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page.toString());
      params = params.set('size', pageSize.toString());
    }

    if (nome) {
      params = params.set('nome', nome);
    }

    return this.httpClient.get<Produto[]>(this.api, { params });
  }

  findById(id: number | string): Observable<Produto> {
    return this.httpClient.get<Produto>(`${this.api}/${id}`);
  }

  create(produto: Produto): Observable<Produto> {
    return this.httpClient.post<Produto>(this.api, produto);
  }

  update(produto: Produto): Observable<void> {
    return this.httpClient.put<void>(`${this.api}/${produto.id}`, produto);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }

  uploadImagem(idProduto: number, arquivo: File): Observable<void> {
    const formData = new FormData();

    formData.append('idProduto', idProduto.toString());
    formData.append('file', arquivo);

    return this.httpClient.patch<void>(`${this.api}/image/upload`, formData);
  }

  removerImagem(fid: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/image/${fid}`);
  }

  urlImagem(fid: string): string {
    return `${this.api}/image/download/${fid}`;
  }

  imagemPrincipal(produto: Produto): string {
    if (produto.imagens && produto.imagens.length > 0 && produto.imagens[0].fid) {
      return this.urlImagem(produto.imagens[0].fid);
    }

    if (produto.imagemUrl) {
      return produto.imagemUrl;
    }

    return 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80';
  }
}