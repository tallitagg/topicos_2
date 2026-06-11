import { Injectable } from '@angular/core';
import { Produto } from '../models/produto';
import { EcommerceAuthService } from './ecommerce-auth.service';

@Injectable({
  providedIn: 'root'
})
export class ListaDesejosService {
  adicionar(produto: Produto) {
    throw new Error('Method not implemented.');
  }
  existe(id: number): boolean {
    throw new Error('Method not implemented.');
  }

  constructor(private authService: EcommerceAuthService) {}

  listar(): Produto[] {
    return JSON.parse(localStorage.getItem(this.key()) || '[]');
  }

  alternar(produto: Produto): void {
    const produtos = this.listar();

    const existe = produtos.some(item => item.id === produto.id);

    const atualizados = existe
      ? produtos.filter(item => item.id !== produto.id)
      : [...produtos, produto];

    localStorage.setItem(this.key(), JSON.stringify(atualizados));
  }

  remover(produtoId: number | undefined): void {
    if (!produtoId) return;

    const produtos = this.listar().filter(item => item.id !== produtoId);
    localStorage.setItem(this.key(), JSON.stringify(produtos));
  }

  contem(produtoId?: number): boolean {
    if (!produtoId) return false;

    return this.listar().some(item => item.id === produtoId);
  }

  quantidadeTotal(): number {
    return this.listar().length;
  }

  limpar(): void {
    localStorage.removeItem(this.key());
  }

  private key(): string {
    const username = this.authService.getUsernameLogado();
    return `listaDesejos_${username}`;
  }
}