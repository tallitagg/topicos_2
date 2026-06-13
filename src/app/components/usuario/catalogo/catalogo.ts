import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { finalize } from 'rxjs/operators';

import { MatIconModule } from '@angular/material/icon';

import { Produto } from '../../../models/produto';
import { ProdutoService } from '../../../services/produto.service';
import { CarrinhoService } from '../../../services/carrinho.service';
import { ListaDesejosService } from '../../../services/lista-desejos.service';

type ProdutoCatalogo = Produto & {
  imagemUrl?: string;
  favorito: boolean;
};

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class CatalogoComponent implements OnInit {
  private produtoService = inject(ProdutoService);
  private carrinhoService = inject(CarrinhoService);
  private listaDesejosService = inject(ListaDesejosService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private apiBaseUrl = `${window.location.protocol}//${window.location.hostname}:8080`;

  busca = '';
  carregando = false;
  erro = '';

  produtos: ProdutoCatalogo[] = [];
  produtosFiltrados: ProdutoCatalogo[] = [];

  skeletons = [1, 2, 3, 4];

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.carregando = true;
    this.erro = '';
    this.produtos = [];
    this.produtosFiltrados = [];
    this.cdr.detectChanges();

    this.produtoService.findAll()
      .pipe(
        finalize(() => {
          this.carregando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (resposta: any) => {
          const lista: Produto[] = this.normalizarRespostaProdutos(resposta);

          this.produtos = lista.map((produto) => {
            const imagemUrl = this.montarUrlImagem(produto);

            const produtoCatalogo: ProdutoCatalogo = {
              ...produto,
              favorito: produto.id !== undefined ? this.estaNosDesejos(produto.id) : false
            };

            if (imagemUrl) {
              produtoCatalogo.imagemUrl = imagemUrl;
            }

            return produtoCatalogo;
          });

          this.produtosFiltrados = [...this.produtos];

          console.log('Produtos carregados no catÃ¡logo:', this.produtos);

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao carregar produtos:', error);

          this.erro = 'NÃ£o foi possÃ­vel carregar os produtos.';
          this.produtos = [];
          this.produtosFiltrados = [];

          this.cdr.detectChanges();
        }
      });
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

  aplicarFiltro(): void {
    const termo = this.busca.trim().toLowerCase();

    if (!termo) {
      this.produtosFiltrados = [...this.produtos];
      this.cdr.detectChanges();
      return;
    }

    this.produtosFiltrados = this.produtos.filter((produto) => {
      const nome = produto.nome?.toLowerCase() ?? '';
      const marca = produto.marca?.nome?.toLowerCase() ?? '';
      const modelo = produto.modelo?.nome?.toLowerCase() ?? '';
      const material = produto.material?.tipo?.toLowerCase() ?? '';
      const capacidade = String(produto.capacidade ?? '').toLowerCase();

      return (
        nome.includes(termo) ||
        marca.includes(termo) ||
        modelo.includes(termo) ||
        material.includes(termo) ||
        capacidade.includes(termo)
      );
    });

    this.cdr.detectChanges();
  }

  limparBusca(): void {
    this.busca = '';
    this.produtosFiltrados = [...this.produtos];
    this.cdr.detectChanges();
  }

  irParaSecao(id: string): void {
    const elemento = document.getElementById(id);

    if (elemento) {
      elemento.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  abrirDetalhe(produto: ProdutoCatalogo): void {
    if (produto.id === undefined) {
      return;
    }

    this.router.navigate(['/produto', produto.id]);
  }

  adicionarAoCarrinho(produto: ProdutoCatalogo, event?: Event): void {
    event?.stopPropagation();

    this.carrinhoService.adicionar(produto);

    this.cdr.detectChanges();
  }

  toggleFavorito(produto: ProdutoCatalogo, event?: Event): void {
    event?.stopPropagation();

    if (produto.id === undefined) {
      return;
    }

    if (produto.favorito) {
      this.listaDesejosService.remover(produto.id);
      produto.favorito = false;
      this.cdr.detectChanges();
      return;
    }

    this.listaDesejosService.adicionar(produto);
    produto.favorito = true;
    this.cdr.detectChanges();
  }

  quantidadeDesejos(): number {
    return this.listaDesejosService.quantidadeTotal();
  }

  quantidadeCarrinho(): number {
    return this.carrinhoService.quantidadeTotal();
  }

  trackByProduto(index: number, produto: ProdutoCatalogo): number {
    return produto.id ?? index;
  }

  private estaNosDesejos(produtoId: number): boolean {
    return this.listaDesejosService.existe(produtoId);
  }

  private montarUrlImagem(produto: Produto): string | undefined {
    const imagens = (produto as any)?.imagens;
    const arquivos = (produto as any)?.arquivos;
    const imagem = (produto as any)?.imagem;

    const fid =
      imagens?.[0]?.fid ||
      arquivos?.[0]?.fid ||
      imagem?.fid;

    if (!fid) {
      return undefined;
    }

    return `${this.apiBaseUrl}/produtos/image/download/${encodeURIComponent(fid)}`;
  }
}
