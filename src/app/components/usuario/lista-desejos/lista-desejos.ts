import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Produto } from '../../../models/produto';
import { CarrinhoService } from '../../../services/carrinho.service';
import { ListaDesejosService } from '../../../services/lista-desejos.service';
import { ProdutoService } from '../../../services/produto.service';

@Component({
  selector: 'app-lista-desejos',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './lista-desejos.html',
  styleUrl: './lista-desejos.css'
})
export class ListaDesejosComponent implements OnInit {

  produtos: Produto[] = [];
  desejos: Produto[] = [];

  constructor(
    private router: Router,
    private snack: MatSnackBar,
    private carrinhoService: CarrinhoService,
    private listaDesejosService: ListaDesejosService,
    private produtoService: ProdutoService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.carregarLista();
  }

  carregarLista(): void {
    this.produtos = this.listaDesejosService.listar();
    this.desejos = this.produtos;
  }

  quantidadeDesejos(): number {
    return this.listaDesejosService.quantidadeTotal();
  }

  quantidadeCarrinho(): number {
    return this.carrinhoService.quantidadeTotal();
  }

  moverParaCarrinho(produto: Produto): void {
    this.carrinhoService.adicionar(produto);
    this.listaDesejosService.remover(produto.id);
    this.carregarLista();

    this.exibirMensagem('Produto movido para o carrinho!');
  }

  adicionarAoCarrinho(produto: Produto): void {
    this.moverParaCarrinho(produto);
  }

  remover(produto: Produto | number | undefined): void {
    const produtoId = typeof produto === 'number'
      ? produto
      : produto?.id;

    if (!produtoId) {
      return;
    }

    this.listaDesejosService.remover(produtoId);
    this.carregarLista();

    this.exibirMensagem('Produto removido da lista de desejos.');
  }

  removerProduto(produto: Produto | number | undefined): void {
    this.remover(produto);
  }

  limparLista(): void {
    this.listaDesejosService.limpar();
    this.carregarLista();

    this.exibirMensagem('Lista de desejos limpa.');
  }

  abrirDetalhes(produto: Produto): void {
    if (!produto.id) {
      return;
    }

    localStorage.setItem('produtoSelecionadoDetalhe', JSON.stringify(produto));
    this.router.navigateByUrl(`/produto/${produto.id}`);
  }

  continuarComprando(): void {
    this.router.navigateByUrl('/catalogo');
  }

  irParaCatalogo(): void {
    this.router.navigateByUrl('/catalogo');
  }

  irParaCarrinho(): void {
    this.router.navigateByUrl('/carrinho');
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  imagemProduto(produto: Produto): string {
    return this.produtoService.imagemPrincipal(produto);
  }

  getImagemProduto(produto: Produto): string {
    return this.imagemProduto(produto);
  }

  trackByProduto(index: number, produto: Produto): number {
    return produto.id || index;
  }

  private exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
