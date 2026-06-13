import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ArquivoProduto, Produto } from '../models/produto';

type ProdutoComArquivos = Produto & {
  arquivos?: ArquivoProduto[];
  imagem?: ArquivoProduto;
};

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
    return this.httpClient.delete<void>(`${this.api}/image/${encodeURIComponent(fid)}`);
  }

  urlImagem(fid: string): string {
    return `${this.api}/image/download/${encodeURIComponent(fid)}`;
  }

  fidImagemPrincipal(produto: Produto | null | undefined): string | null {
    if (!produto) {
      return null;
    }

    const produtoComArquivos = produto as ProdutoComArquivos;

    if (produtoComArquivos.imagens?.length && produtoComArquivos.imagens[0]?.fid) {
      return produtoComArquivos.imagens[0].fid;
    }

    if (produtoComArquivos.arquivos?.length && produtoComArquivos.arquivos[0]?.fid) {
      return produtoComArquivos.arquivos[0].fid;
    }

    if (produtoComArquivos.imagem?.fid) {
      return produtoComArquivos.imagem.fid;
    }

    return null;
  }

  imagemPrincipal(produto: Produto | null | undefined): string {
    const fid = this.fidImagemPrincipal(produto);

    if (fid) {
      return this.urlImagem(fid);
    }

    return produto?.imagemUrl || '';
  }
}