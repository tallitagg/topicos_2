import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { catchError, finalize, of, timeout } from 'rxjs';

import { Produto } from '../../models/produto';
import { ProdutoService } from '../../services/produto.service';
import { CarrinhoService } from '../../services/carrinho.service';
import { ListaDesejosService } from '../../services/lista-desejos.service';

@Component({
  selector: 'app-produto-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './produto-detalhe.html',
  styleUrl: './produto-detalhe.css'
})
export class ProdutoDetalheComponent implements OnInit {

  produto: Produto | null = null;
  produtosRelacionados: Produto[] = [];

  carregando = true;
  erro = false;

  private readonly catalogoCacheKey = 'catalogoProdutos';
  private readonly produtoSelecionadoKey = 'produtoSelecionadoDetalhe';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produtoService: ProdutoService,
    private carrinhoService: CarrinhoService,
    private desejosService: ListaDesejosService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (!id) {
        this.erro = true;
        this.carregando = false;
        return;
      }

      this.carregarProdutoRapido(id);
    });
  }

  carregarProdutoRapido(id: string): void {
    window.scrollTo(0, 0);

    this.carregando = true;
    this.erro = false;
    this.produto = null;
    this.produtosRelacionados = [];

    const produtoCache = this.buscarProdutoNoCache(id);

    if (produtoCache) {
      this.produto = produtoCache;
      this.carregando = false;
      this.buscarRelacionados(produtoCache);
    }

    this.buscarProdutoNaApi(id, !!produtoCache);
  }

  buscarProdutoNaApi(id: string, jaTemProdutoNaTela: boolean): void {
    this.produtoService.findById(id)
      .pipe(
        timeout(5000),
        catchError(() => {
          if (!jaTemProdutoNaTela) {
            this.erro = true;
          }

          return of(null);
        }),
        finalize(() => {
          this.carregando = false;
        })
      )
      .subscribe((produto: Produto | null) => {
        if (!produto) {
          return;
        }

        this.produto = produto;
        this.salvarProdutoSelecionado(produto);
        this.atualizarProdutoNoCache(produto);
        this.buscarRelacionados(produto);
        this.erro = false;
      });
  }

  buscarRelacionados(produtoAtual: Produto): void {
    const produtosCache = this.buscarProdutosNoCache();

    if (produtosCache.length > 0) {
      this.produtosRelacionados = this.filtrarRelacionados(produtoAtual, produtosCache);
    }

    this.produtoService.findAll()
      .pipe(
        timeout(5000),
        catchError(() => {
          return of([] as Produto[]);
        })
      )
      .subscribe((produtos: Produto[]) => {
        if (produtos.length === 0) {
          return;
        }

        localStorage.setItem(this.catalogoCacheKey, JSON.stringify(produtos));
        this.produtosRelacionados = this.filtrarRelacionados(produtoAtual, produtos);
      });
  }

  filtrarRelacionados(produtoAtual: Produto, produtos: Produto[]): Produto[] {
    const relacionados = produtos
      .filter(produto => produto.id !== produtoAtual.id)
      .filter(produto => this.ehRelacionado(produtoAtual, produto));

    if (relacionados.length > 0) {
      return relacionados.slice(0, 4);
    }

    return produtos
      .filter(produto => produto.id !== produtoAtual.id)
      .slice(0, 4);
  }

  ehRelacionado(produtoAtual: Produto, produto: Produto): boolean {
    const mesmaMarca = produtoAtual.marca?.id
      && produto.marca?.id
      && produtoAtual.marca.id === produto.marca.id;

    const mesmoMaterial = produtoAtual.material?.id
      && produto.material?.id
      && produtoAtual.material.id === produto.material.id;

    const mesmoModelo = produtoAtual.modelo?.id
      && produto.modelo?.id
      && produtoAtual.modelo.id === produto.modelo.id;

    const mesmoIsolamento = produtoAtual.tipoIsolamento?.id
      && produto.tipoIsolamento?.id
      && produtoAtual.tipoIsolamento.id === produto.tipoIsolamento.id;

    return !!(mesmaMarca || mesmoMaterial || mesmoModelo || mesmoIsolamento);
  }

  abrirDetalhes(produto: Produto): void {
    if (!produto || produto.id === undefined || produto.id === null) {
      this.exibirMensagem('Não foi possível abrir este produto.');
      return;
    }

    localStorage.setItem(this.produtoSelecionadoKey, JSON.stringify(produto));
    this.router.navigateByUrl(`/produto/${produto.id}`);
  }

  adicionarAoCarrinho(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!this.produto) {
      return;
    }

    this.carrinhoService.adicionar(this.produto);
    this.exibirMensagem('Produto adicionado ao carrinho!');
  }

  comprarAgora(): void {
    if (!this.produto) {
      return;
    }

    this.carrinhoService.adicionar(this.produto);
    this.router.navigateByUrl('/carrinho');
  }

  adicionarRelacionadoAoCarrinho(produto: Produto, event: Event): void {
    event.stopPropagation();

    this.carrinhoService.adicionar(produto);
    this.exibirMensagem('Produto adicionado ao carrinho!');
  }

  alternarDesejo(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!this.produto) {
      return;
    }

    this.desejosService.alternar(this.produto);

    if (this.estaNosDesejos()) {
      this.exibirMensagem('Produto adicionado aos favoritos!');
    } else {
      this.exibirMensagem('Produto removido dos favoritos.');
    }
  }

  alternarDesejoRelacionado(produto: Produto, event: Event): void {
    event.stopPropagation();

    this.desejosService.alternar(produto);

    if (this.desejosService.contem(produto.id)) {
      this.exibirMensagem('Produto adicionado aos favoritos!');
    } else {
      this.exibirMensagem('Produto removido dos favoritos.');
    }
  }

  estaNosDesejos(): boolean {
    return this.desejosService.contem(this.produto?.id);
  }

  estaRelacionadoNosDesejos(produto: Produto): boolean {
    return this.desejosService.contem(produto.id);
  }

  quantidadeCarrinho(): number {
    return this.carrinhoService.quantidadeTotal();
  }

  quantidadeDesejos(): number {
    return this.desejosService.quantidadeTotal();
  }

  getImagemProduto(produto?: Produto | null): string | null {
    const item = produto || this.produto;

    if (!item) {
      return null;
    }

    return item.imagemUrl && item.imagemUrl.trim()
      ? item.imagemUrl
      : null;
  }

  formatarPreco(valor: number | undefined): string {
    const preco = valor || 0;

    return preco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  descricaoProduto(): string {
    return this.produto?.descricao && this.produto.descricao.trim()
      ? this.produto.descricao
      : 'Produto desenvolvido para manter sua bebida na temperatura ideal, combinando praticidade, resistência e design premium para o uso diário.';
  }

  capacidadeProduto(produto?: Produto | null): string {
    const item = produto || this.produto;

    if (!item?.capacidade) {
      return 'Não informada';
    }

    return `${item.capacidade}L`;
  }

  estoqueProduto(): string {
    if (this.produto?.estoque === undefined || this.produto?.estoque === null) {
      return 'Disponível';
    }

    if (this.produto.estoque > 0) {
      return `${this.produto.estoque} unidade(s) disponível(is)`;
    }

    return 'Produto indisponível';
  }

  nomeMarca(produto?: Produto | null): string {
    const item = produto || this.produto;
    return item?.marca?.nome || 'Marca não informada';
  }

  nomeModelo(): string {
    return this.produto?.modelo?.nome || 'Modelo não informado';
  }

  anoModelo(): string {
    if (!this.produto?.modelo?.anoLancamento) {
      return 'Não informado';
    }

    return `${this.produto.modelo.anoLancamento}`;
  }

  nomeMaterial(produto?: Produto | null): string {
    const item = produto || this.produto;
    return item?.material?.tipo || 'Material não informado';
  }

  resistenciaMaterial(): string {
    if (!this.produto?.material?.resistenciaTemperatura) {
      return 'Não informada';
    }

    return `${this.produto.material.resistenciaTemperatura}°C`;
  }

  descricaoTampa(): string {
    return this.produto?.tipoTampa?.descricao || 'Tipo de tampa não informado';
  }

  materialTampa(): string {
    return this.produto?.tipoTampa?.material || 'Material da tampa não informado';
  }

  descricaoIsolamento(): string {
    return this.produto?.tipoIsolamento?.descricao || 'Tipo de isolamento não informado';
  }

  eficienciaIsolamento(): string {
    if (!this.produto?.tipoIsolamento?.eficienciaTermica) {
      return 'Não informada';
    }

    return `${this.produto.tipoIsolamento.eficienciaTermica}h`;
  }

  voltar(): void {
    this.router.navigateByUrl('/catalogo');
  }

  private buscarProdutoNoCache(id: string): Produto | null {
    const produtoSelecionado = this.buscarProdutoSelecionado();

    if (produtoSelecionado && String(produtoSelecionado.id) === String(id)) {
      return produtoSelecionado;
    }

    const produtos = this.buscarProdutosNoCache();

    const encontrado = produtos.find(produto => String(produto.id) === String(id));

    return encontrado || null;
  }

  private buscarProdutoSelecionado(): Produto | null {
    try {
      return JSON.parse(localStorage.getItem(this.produtoSelecionadoKey) || 'null');
    } catch {
      return null;
    }
  }

  private salvarProdutoSelecionado(produto: Produto): void {
    localStorage.setItem(this.produtoSelecionadoKey, JSON.stringify(produto));
  }

  private buscarProdutosNoCache(): Produto[] {
    try {
      return JSON.parse(localStorage.getItem(this.catalogoCacheKey) || '[]');
    } catch {
      return [];
    }
  }

  private atualizarProdutoNoCache(produtoAtualizado: Produto): void {
    const produtos = this.buscarProdutosNoCache();

    if (produtos.length === 0) {
      return;
    }

    const atualizados = produtos.map(produto => {
      if (produto.id === produtoAtualizado.id) {
        return produtoAtualizado;
      }

      return produto;
    });

    localStorage.setItem(this.catalogoCacheKey, JSON.stringify(atualizados));
  }

  private exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}