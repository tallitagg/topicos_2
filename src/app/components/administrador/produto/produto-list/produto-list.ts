import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Produto } from '../../../../models/produto';
import { ProdutoService } from '../../../../services/produto.service';

@Component({
  selector: 'app-produto-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './produto-list.html',
  styleUrl: './produto-list.css'
})
export class ProdutoList implements OnInit {

  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];

  termoBusca = '';
  carregando = false;
  erro = '';

  paginaAtual = 1;
  itensPorPagina = 5;
  opcoesItensPorPagina = [5, 10, 15, 20];

  private readonly apiBaseUrl = `${window.location.protocol}//${window.location.hostname}:8080`;

  constructor(
    private produtoService: ProdutoService,
    private snack: MatSnackBar,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.carregando = true;
    this.erro = '';

    this.produtoService.findAll().subscribe({
      next: (resposta: any) => {
        this.produtos = this.normalizarRespostaProdutos(resposta);
        this.produtosFiltrados = [...this.produtos];
        this.paginaAtual = 1;

        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (erro: unknown) => {
        console.error('Erro ao carregar produtos:', erro);

        this.erro = 'Não foi possível carregar os produtos.';
        this.produtos = [];
        this.produtosFiltrados = [];
        this.paginaAtual = 1;
        this.carregando = false;

        this.exibirMensagem('Não foi possível carregar os produtos.');
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltro(): void {
    const termo = this.termoBusca.trim().toLowerCase();

    if (!termo) {
      this.produtosFiltrados = [...this.produtos];
      this.paginaAtual = 1;
      return;
    }

    this.produtosFiltrados = this.produtos.filter((produto) => {
      const nome = produto.nome?.toLowerCase() || '';
      const descricao = produto.descricao?.toLowerCase() || '';
      const marca = produto.marca?.nome?.toLowerCase() || '';
      const modelo = produto.modelo?.nome?.toLowerCase() || '';
      const material = produto.material?.tipo?.toLowerCase() || '';
      const capacidade = String(produto.capacidade || '').toLowerCase();
      const estoque = String(produto.estoque || '').toLowerCase();
      const preco = String(produto.preco || '').toLowerCase();

      return (
        nome.includes(termo) ||
        descricao.includes(termo) ||
        marca.includes(termo) ||
        modelo.includes(termo) ||
        material.includes(termo) ||
        capacidade.includes(termo) ||
        estoque.includes(termo) ||
        preco.includes(termo)
      );
    });

    this.paginaAtual = 1;
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.produtosFiltrados = [...this.produtos];
    this.paginaAtual = 1;
  }

  produtosPaginados(): Produto[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;

    return this.produtosFiltrados.slice(inicio, fim);
  }

  totalPaginas(): number {
    const total = Math.ceil(this.produtosFiltrados.length / this.itensPorPagina);
    return total > 0 ? total : 1;
  }

  primeiroItemPagina(): number {
    if (this.produtosFiltrados.length === 0) {
      return 0;
    }

    return ((this.paginaAtual - 1) * this.itensPorPagina) + 1;
  }

  ultimoItemPagina(): number {
    const fim = this.paginaAtual * this.itensPorPagina;
    return Math.min(fim, this.produtosFiltrados.length);
  }

  paginasVisiveis(): number[] {
    const total = this.totalPaginas();
    const paginas: number[] = [];

    for (let pagina = 1; pagina <= total; pagina++) {
      paginas.push(pagina);
    }

    return paginas;
  }

  irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) {
      return;
    }

    this.paginaAtual = pagina;
  }

  paginaAnterior(): void {
    this.irParaPagina(this.paginaAtual - 1);
  }

  proximaPagina(): void {
    this.irParaPagina(this.paginaAtual + 1);
  }

  alterarItensPorPagina(valor: string | number): void {
    this.itensPorPagina = Number(valor);
    this.paginaAtual = 1;
  }

  novoProduto(): void {
    this.router.navigateByUrl('/admin/produtos/new');
  }

  editarProduto(produto: Produto): void {
    if (!produto.id) {
      this.exibirMensagem('Não foi possível editar este produto.');
      return;
    }

    this.router.navigateByUrl(`/admin/produtos/edit/${produto.id}`);
  }

  excluirProduto(produto: Produto): void {
    if (!produto.id) {
      this.exibirMensagem('Não foi possível excluir este produto.');
      return;
    }

    const confirmar = confirm(`Deseja realmente excluir o produto "${produto.nome}"?`);

    if (!confirmar) {
      return;
    }

    this.produtoService.delete(produto.id).subscribe({
      next: () => {
        this.exibirMensagem('Produto excluído com sucesso.');
        this.carregarProdutos();
      },
      error: (erro: unknown) => {
        console.error('Erro ao excluir produto:', erro);
        this.exibirMensagem('Não foi possível excluir o produto.');
      }
    });
  }

  voltarDashboard(): void {
    this.router.navigateByUrl('/admin');
  }

  abrirCatalogo(): void {
    this.router.navigateByUrl('/catalogo');
  }

  totalProdutos(): number {
    return this.produtos.length;
  }

  estoqueTotal(): number {
    return this.produtos.reduce((total, produto) => {
      return total + Number(produto.estoque || 0);
    }, 0);
  }

  valorEmEstoque(): number {
    return this.produtos.reduce((total, produto) => {
      const preco = Number(produto.preco || 0);
      const estoque = Number(produto.estoque || 0);

      return total + (preco * estoque);
    }, 0);
  }

  produtosSemEstoque(): number {
    return this.produtos.filter(produto => Number(produto.estoque || 0) <= 0).length;
  }

  produtosComImagem(): number {
    return this.produtos.filter(produto => !!this.getImagemProduto(produto)).length;
  }

  statusEstoque(produto: Produto): string {
    const estoque = Number(produto.estoque || 0);

    if (estoque <= 0) {
      return 'Sem estoque';
    }

    if (estoque <= 5) {
      return 'Baixo estoque';
    }

    return 'Disponível';
  }

  classeStatusEstoque(produto: Produto): string {
    const estoque = Number(produto.estoque || 0);

    if (estoque <= 0) {
      return 'danger';
    }

    if (estoque <= 5) {
      return 'warning';
    }

    return 'success';
  }

  formatarPreco(valor: number | undefined): string {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  capacidadeProduto(produto: Produto): string {
    if (produto.capacidade === null || produto.capacidade === undefined) {
      return 'Não informada';
    }

    return `${produto.capacidade}L`;
  }

  nomeMarca(produto: Produto): string {
    return produto.marca?.nome || 'Marca não informada';
  }

  nomeModelo(produto: Produto): string {
    return produto.modelo?.nome || 'Modelo não informado';
  }

  nomeMaterial(produto: Produto): string {
    return produto.material?.tipo || 'Material não informado';
  }

  getImagemProduto(produto: Produto): string | null {
    if (produto.imagemUrl && produto.imagemUrl.trim()) {
      return produto.imagemUrl;
    }

    const fid = this.getFidProduto(produto);

    if (!fid) {
      return null;
    }

    return `${this.apiBaseUrl}/produtos/image/download/${encodeURIComponent(fid)}`;
  }

  trackByProduto(index: number, produto: Produto): number {
    return produto.id || index;
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