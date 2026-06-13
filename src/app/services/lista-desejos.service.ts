import { Injectable } from '@angular/core';
import { Produto } from '../models/produto';
import { EcommerceAuthService } from './ecommerce-auth.service';

@Injectable({
  providedIn: 'root'
})
export class ListaDesejosService {

  constructor(private authService: EcommerceAuthService) {}

  listar(): Produto[] {
    return JSON.parse(localStorage.getItem(this.key()) || '[]');
  }

  adicionar(produto: Produto): void {
    if (!produto || produto.id === undefined || produto.id === null) {
      return;
    }

    const produtos = this.listar();
    const jaExiste = produtos.some(item => item.id === produto.id);

    if (!jaExiste) {
      localStorage.setItem(this.key(), JSON.stringify([...produtos, produto]));
    }
  }

  alternar(produto: Produto): void {
    if (!produto || produto.id === undefined || produto.id === null) {
      return;
    }

    if (this.existe(produto.id)) {
      this.remover(produto.id);
      return;
    }

    this.adicionar(produto);
  }

  remover(produtoId: number | undefined): void {
    if (!produtoId) {
      return;
    }

    const produtos = this.listar().filter(item => item.id !== produtoId);
    localStorage.setItem(this.key(), JSON.stringify(produtos));
  }

  existe(produtoId?: number): boolean {
    if (!produtoId) {
      return false;
    }

    return this.listar().some(item => item.id === produtoId);
  }

  contem(produtoId?: number): boolean {
    return this.existe(produtoId);
  }

  quantidadeTotal(): number {
    return this.listar().length;
  }

  limpar(): void {
    localStorage.removeItem(this.key());
  }

  private key(): string {
    const username = this.authService.getUsernameLogado() || 'visitante';
    return `listaDesejos_${username}`;
  }
}