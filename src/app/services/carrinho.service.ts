import { Injectable } from '@angular/core';
import { Produto } from '../models/produto';
import { EcommerceAuthService } from './ecommerce-auth.service';

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {

  constructor(private authService: EcommerceAuthService) {}

  listar(): ItemCarrinho[] {
    return JSON.parse(localStorage.getItem(this.key()) || '[]');
  }

  adicionar(produto: Produto): void {
    const itens = this.listar();

    const existente = itens.find(item => item.produto.id === produto.id);

    if (existente) {
      existente.quantidade += 1;
    } else {
      itens.push({
        produto,
        quantidade: 1
      });
    }

    this.salvar(itens);
  }

  aumentar(produtoId: number | undefined): void {
    if (!produtoId) return;

    const itens = this.listar();
    const item = itens.find(i => i.produto.id === produtoId);

    if (item) {
      item.quantidade += 1;
      this.salvar(itens);
    }
  }

  diminuir(produtoId: number | undefined): void {
    if (!produtoId) return;

    const itens = this.listar();
    const item = itens.find(i => i.produto.id === produtoId);

    if (!item) return;

    if (item.quantidade > 1) {
      item.quantidade -= 1;
      this.salvar(itens);
    } else {
      this.remover(produtoId);
    }
  }

  remover(produtoId: number | undefined): void {
    if (!produtoId) return;

    const itens = this.listar().filter(item => item.produto.id !== produtoId);
    this.salvar(itens);
  }

  limpar(): void {
    localStorage.removeItem(this.key());
  }

  quantidadeTotal(): number {
    return this.listar().reduce((total, item) => total + item.quantidade, 0);
  }

  subtotalItem(item: ItemCarrinho): number {
    return item.quantidade * item.produto.preco;
  }

  total(): number {
    return this.listar().reduce((total, item) => {
      return total + this.subtotalItem(item);
    }, 0);
  }

  private salvar(itens: ItemCarrinho[]): void {
    localStorage.setItem(this.key(), JSON.stringify(itens));
  }

  private key(): string {
    const username = this.authService.getUsernameLogado();
    return `carrinho_${username}`;
  }
}