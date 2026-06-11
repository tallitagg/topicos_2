import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CarrinhoService, ItemCarrinho } from '../../services/carrinho.service';
import { ListaDesejosService } from '../../services/lista-desejos.service';
import { ProdutoService } from '../../services/produto.service';
import { Produto } from '../../models/produto';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css'
})
export class CarrinhoComponent implements OnInit {

  itens: ItemCarrinho[] = [];
  recomendados: Produto[] = [];

  constructor(
    private carrinhoService: CarrinhoService,
    private desejosService: ListaDesejosService,
    private produtoService: ProdutoService,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.carregarCarrinho();
    this.carregarRecomendados();
  }

  carregarCarrinho(): void {
    this.itens = this.carrinhoService.listar();
  }

  carregarRecomendados(): void {
    this.produtoService.findAll().subscribe({
      next: (produtos: Produto[]) => {
        const idsCarrinho = this.itens.map(item => item.produto.id);

        this.recomendados = produtos
          .filter(produto => !idsCarrinho.includes(produto.id))
          .slice(0, 4);
      },
      error: () => {
        this.recomendados = [];
      }
    });
  }

  aumentar(produtoId: number | undefined): void {
    this.carrinhoService.aumentar(produtoId);
    this.carregarCarrinho();
    this.carregarRecomendados();
  }

  diminuir(produtoId: number | undefined): void {
    this.carrinhoService.diminuir(produtoId);
    this.carregarCarrinho();
    this.carregarRecomendados();
  }

  remover(produtoId: number | undefined): void {
    this.carrinhoService.remover(produtoId);
    this.carregarCarrinho();
    this.carregarRecomendados();
    this.exibirMensagem('Produto removido do carrinho.');
  }

  adicionarRecomendado(produto: Produto): void {
    this.carrinhoService.adicionar(produto);
    this.carregarCarrinho();
    this.carregarRecomendados();
    this.exibirMensagem('Produto adicionado ao carrinho!');
  }

  finalizarCompra(): void {
    if (this.itens.length === 0) {
      this.exibirMensagem('Seu carrinho está vazio.');
      return;
    }

    this.router.navigateByUrl('/finalizar-compra');
  }

  continuarComprando(): void {
    this.router.navigateByUrl('/catalogo');
  }

  quantidadeCarrinho(): number {
    return this.carrinhoService.quantidadeTotal();
  }

  quantidadeDesejos(): number {
    return this.desejosService.quantidadeTotal();
  }

  subtotal(): number {
    return this.carrinhoService.total();
  }

  frete(): number {
    return this.itens.length > 0 ? 0 : 0;
  }

  desconto(): number {
    return 0;
  }

  total(): number {
    return this.subtotal() + this.frete() - this.desconto();
  }

  subtotalItem(item: ItemCarrinho): number {
    return this.carrinhoService.subtotalItem(item);
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  getImagemProduto(produto: Produto): string | null {
    return produto.imagemUrl && produto.imagemUrl.trim()
      ? produto.imagemUrl
      : null;
  }

  private exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}