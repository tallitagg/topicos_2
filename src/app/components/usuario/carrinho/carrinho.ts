import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CarrinhoService, ItemCarrinho } from '../../../services/carrinho.service';
import { ListaDesejosService } from '../../../services/lista-desejos.service';
import { ProdutoService } from '../../../services/produto.service';
import { Produto } from '../../../models/produto';

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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.carregarCarrinho();
    this.carregarRecomendados();
  }

  carregarCarrinho(): void {
    this.itens = this.carrinhoService.listar();
    this.atualizarProdutosDoCarrinho();
  }

  carregarRecomendados(): void {
    this.produtoService.findAll().subscribe({
      next: (resposta: any) => {
        const produtos = this.normalizarRespostaProdutos(resposta);
        const idsCarrinho = this.itens.map(item => item.produto.id);

        this.recomendados = produtos
          .filter(produto => !idsCarrinho.includes(produto.id))
          .slice(0, 4);

        this.cdr.detectChanges();
      },
      error: () => {
        this.recomendados = [];
        this.cdr.detectChanges();
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
      this.exibirMensagem('Seu carrinho estÃ¡ vazio.');
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
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  getImagemProduto(produto: Produto): string | null {
    if (produto.imagemUrl && produto.imagemUrl.trim()) {
      return produto.imagemUrl;
    }

    const fid = this.getFidProduto(produto);

    if (!fid) {
      return null;
    }

    return `http://localhost:8080/produtos/image/download/${encodeURIComponent(fid)}`;
  }

  private atualizarProdutosDoCarrinho(): void {
    this.itens.forEach((item, index) => {
      const produtoId = item.produto.id;

      if (!produtoId) {
        return;
      }

      if (this.getImagemProduto(item.produto)) {
        return;
      }

      this.produtoService.findById(produtoId).subscribe({
        next: (produtoAtualizado) => {
          const produtoMesclado: Produto = {
            ...item.produto,
            ...produtoAtualizado
          };

          this.itens[index] = {
            ...item,
            produto: produtoMesclado
          };

          this.carrinhoService.atualizarProduto(produtoMesclado);

          this.itens = [...this.itens];

          this.cdr.detectChanges();
        },
        error: (erro) => {
          console.error('Erro ao atualizar produto do carrinho:', erro);
        }
      });
    });
  }

  private getFidProduto(produto: Produto): string | null {
    const imagens = (produto as any)?.imagens;
    const arquivos = (produto as any)?.arquivos;
    const imagem = (produto as any)?.imagem;

    const fid =
      imagens?.[0]?.fid ||
      arquivos?.[0]?.fid ||
      imagem?.fid;

    return fid || null;
  }

  private normalizarRespostaProdutos(resposta: any): Produto[] {
    if (Array.isArray(resposta)) {
      return resposta;
    }

    if (Array.isArray(resposta?.content)) {
      return resposta.content;
    }

    if (Array.isArray(resposta?.data)) {
      return resposta.data;
    }

    if (Array.isArray(resposta?.items)) {
      return resposta.items;
    }

    if (Array.isArray(resposta?.produtos)) {
      return resposta.produtos;
    }

    return [];
  }

  private exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
