import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, of, take, timeout } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Produto } from '../../models/produto';
import { CarrinhoService } from '../../services/carrinho.service';
import { ListaDesejosService } from '../../services/lista-desejos.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class CatalogoComponent implements OnInit {

  private readonly apiProdutos = 'http://localhost:8080/produtos';

  private readonly imagemPadrao =
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80';

  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];

  termoBusca = '';
  carregando = false;
  erroCarregamento = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snack: MatSnackBar,
    private carrinhoService: CarrinhoService,
    private listaDesejosService: ListaDesejosService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.carregando = true;
    this.erroCarregamento = false;

    this.http.get<any>(`${this.apiProdutos}?_=${Date.now()}`)
      .pipe(
        take(1),
        timeout(8000),
        catchError((erro) => {
          console.error('Erro ao carregar produtos no catálogo:', erro);

          this.produtos = [];
          this.produtosFiltrados = [];
          this.erroCarregamento = true;

          this.exibirMensagem('Não foi possível carregar os produtos. Confira se o back-end está rodando.');

          return of([]);
        }),
        finalize(() => {
          this.carregando = false;
        })
      )
      .subscribe((resposta) => {
        const produtos = this.normalizarRespostaProdutos(resposta);

        this.produtos = produtos;
        this.produtosFiltrados = [...produtos];

        console.log('Produtos carregados no catálogo:', produtos);
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

  buscar(): void {
    const termo = this.termoBusca.trim().toLowerCase();

    if (!termo) {
      this.produtosFiltrados = [...this.produtos];
      return;
    }

    this.produtosFiltrados = this.produtos.filter((produto) => {
      const nome = produto.nome?.toLowerCase() || '';
      const descricao = produto.descricao?.toLowerCase() || '';
      const marca = produto.marca?.nome?.toLowerCase() || '';
      const modelo = produto.modelo?.nome?.toLowerCase() || '';
      const material = produto.material?.tipo?.toLowerCase() || '';
      const capacidade = String(produto.capacidade || '').toLowerCase();
      const preco = String(produto.preco || '').toLowerCase();
      const cores = produto.cores?.map(cor => cor.nome).join(' ').toLowerCase() || '';

      return (
        nome.includes(termo) ||
        descricao.includes(termo) ||
        marca.includes(termo) ||
        modelo.includes(termo) ||
        material.includes(termo) ||
        capacidade.includes(termo) ||
        preco.includes(termo) ||
        cores.includes(termo)
      );
    });
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.produtosFiltrados = [...this.produtos];
  }

  imagemProduto(produto: Produto): string {
    const fid = produto.imagens?.[0]?.fid;

    if (fid) {
      return `${this.apiProdutos}/image/download/${fid}`;
    }

    if (produto.imagemUrl) {
      return produto.imagemUrl;
    }

    return this.imagemPadrao;
  }

  tratarErroImagem(event: Event): void {
    const img = event.target as HTMLImageElement;

    if (img.src !== this.imagemPadrao) {
      img.src = this.imagemPadrao;
    }
  }

  abrirDetalhes(produto: Produto): void {
    if (!produto.id) {
      return;
    }

    localStorage.setItem('produtoSelecionadoDetalhe', JSON.stringify(produto));
    this.router.navigateByUrl(`/produto/${produto.id}`);
  }

  adicionarAoCarrinho(produto: Produto, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.carrinhoService.adicionar(produto);
    this.exibirMensagem('Produto adicionado ao carrinho!');
  }

  alternarFavorito(produto: Produto, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!produto.id) {
      return;
    }

    if (this.estaNosFavoritos(produto)) {
      this.listaDesejosService.remover(produto.id);
      this.exibirMensagem('Produto removido dos favoritos.');
      return;
    }

    this.listaDesejosService.adicionar(produto);
    this.exibirMensagem('Produto adicionado aos favoritos!');
  }

  estaNosFavoritos(produto: Produto): boolean {
    if (!produto.id) {
      return false;
    }

    return this.listaDesejosService.existe(produto.id);
  }

  quantidadeCarrinho(): number {
    return this.carrinhoService.quantidadeTotal();
  }

  quantidadeFavoritos(): number {
    return this.listaDesejosService.quantidadeTotal();
  }

  formatarPreco(valor: number): string {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  capacidadeProduto(produto: Produto): string {
    if (produto.capacidade === null || produto.capacidade === undefined) {
      return 'Capacidade não informada';
    }

    return `${produto.capacidade}L`;
  }

  marcaProduto(produto: Produto): string {
    return produto.marca?.nome || 'E-Garrafas';
  }

  descricaoProduto(produto: Produto): string {
    return produto.descricao || 'Garrafa térmica premium para uso diário.';
  }

  trackByProduto(index: number, produto: Produto): number {
    return produto.id || index;
  }

  irParaInicio(): void {
    this.rolarPara('inicio');
  }

  irParaCatalogo(): void {
    this.rolarPara('catalogo');
  }

  irParaOfertas(): void {
    this.rolarPara('ofertas');
  }

  irParaSobre(): void {
    this.rolarPara('sobre');
  }

  irParaPerfil(): void {
    this.router.navigateByUrl('/perfil');
  }

  irParaCarrinho(): void {
    this.router.navigateByUrl('/carrinho');
  }

  irParaFavoritos(): void {
    this.router.navigateByUrl('/desejos');
  }

  private rolarPara(id: string): void {
    const elemento = document.getElementById(id);

    if (elemento) {
      elemento.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  private exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}