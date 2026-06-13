import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

import { Produto } from '../../../../models/produto';
import { ProdutoService } from '../../../../services/produto.service';

type AbaAdminId = 'dashboard' | 'produtos' | 'marcas' | 'modelos' | 'materiais' | 'cores';

interface AbaAdmin {
  id: AbaAdminId;
  titulo: string;
  subtitulo: string;
  descricao: string;
  rota?: string;
  icone: string;
  destaque: string;
  pontos: string[];
}

interface IndicadoresDashboard {
  totalProdutos: number;
  estoqueTotal: number;
  valorEmEstoque: number;
  baixoEstoque: number;
  semEstoque: number;
  produtosComImagem: number;
  valorVendido: number;
  vendasRegistradas: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  abaAtiva: AbaAdminId = 'dashboard';
  carregando = false;

  produtos: Produto[] = [];

  indicadores: IndicadoresDashboard = {
    totalProdutos: 0,
    estoqueTotal: 0,
    valorEmEstoque: 0,
    baixoEstoque: 0,
    semEstoque: 0,
    produtosComImagem: 0,
    valorVendido: 0,
    vendasRegistradas: 0
  };

  abas: AbaAdmin[] = [
    {
      id: 'dashboard',
      titulo: 'Dashboard',
      subtitulo: 'Visão geral',
      descricao: 'Acompanhe os principais indicadores do e-commerce e a situação atual do catálogo.',
      icone: 'dashboard',
      destaque: 'Indicadores',
      pontos: [
        'Valor vendido registrado no navegador',
        'Valor estimado em estoque',
        'Produtos cadastrados e situação do estoque'
      ]
    },
    {
      id: 'produtos',
      titulo: 'Produtos',
      subtitulo: 'Catálogo',
      descricao: 'Gerencie os produtos exibidos no catálogo do cliente, incluindo preço, estoque, capacidade e imagem.',
      rota: '/admin/produtos',
      icone: 'inventory_2',
      destaque: 'Gestão principal',
      pontos: [
        'Cadastrar novas garrafas térmicas',
        'Editar preço, estoque e capacidade',
        'Enviar e atualizar imagem dos produtos'
      ]
    },
    {
      id: 'marcas',
      titulo: 'Marcas',
      subtitulo: 'Cadastro auxiliar',
      descricao: 'Organize as marcas utilizadas nos produtos para manter o catálogo padronizado.',
      rota: '/admin/marcas',
      icone: 'sell',
      destaque: 'Organização',
      pontos: [
        'Cadastrar marcas',
        'Editar informações existentes',
        'Padronizar a apresentação dos produtos'
      ]
    },
    {
      id: 'modelos',
      titulo: 'Modelos',
      subtitulo: 'Estrutura do produto',
      descricao: 'Controle os modelos das garrafas e vincule cada modelo à sua respectiva marca.',
      rota: '/admin/modelos',
      icone: 'category',
      destaque: 'Relacionamento',
      pontos: [
        'Cadastrar modelos por marca',
        'Organizar variações de produto',
        'Facilitar a busca e classificação'
      ]
    },
    {
      id: 'materiais',
      titulo: 'Materiais',
      subtitulo: 'Especificações',
      descricao: 'Gerencie materiais e características técnicas, como resistência de temperatura.',
      rota: '/admin/materiais',
      icone: 'construction',
      destaque: 'Dados técnicos',
      pontos: [
        'Cadastrar tipos de material',
        'Informar resistência térmica',
        'Apoiar a descrição técnica dos produtos'
      ]
    },
    {
      id: 'cores',
      titulo: 'Cores',
      subtitulo: 'Variações visuais',
      descricao: 'Cadastre as cores disponíveis para melhorar a identificação dos produtos no sistema.',
      rota: '/admin/cores',
      icone: 'palette',
      destaque: 'Variações',
      pontos: [
        'Cadastrar cores disponíveis',
        'Definir códigos visuais',
        'Ajudar na diferenciação dos produtos'
      ]
    }
  ];

  constructor(
    private produtoService: ProdutoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarIndicadores();
  }

  selecionarAba(id: AbaAdminId): void {
  this.abaAtiva = id;

  if (id === 'dashboard') {
    this.carregarIndicadores();
  }
}

  get abaSelecionada(): AbaAdmin {
    return this.abas.find(aba => aba.id === this.abaAtiva) || this.abas[0];
  }

  carregarIndicadores(): void {
    this.carregando = true;

    this.produtoService.findAll().subscribe({
      next: (resposta: any) => {
        this.produtos = this.normalizarRespostaProdutos(resposta);
        this.calcularIndicadores();
        this.carregando = false;
      },
      error: (erro: unknown) => {
        console.error('Erro ao carregar indicadores do dashboard:', erro);
        this.produtos = [];
        this.calcularIndicadores();
        this.carregando = false;
      }
    });
  }

  abrirGerenciamento(): void {
    if (!this.abaSelecionada.rota) {
      return;
    }

    this.router.navigateByUrl(this.abaSelecionada.rota);
  }

  irParaCatalogo(): void {
    this.router.navigateByUrl('/catalogo');
  }

  formatarMoeda(valor: number): string {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  formatarNumero(valor: number): string {
    return Number(valor || 0).toLocaleString('pt-BR');
  }

  percentualComImagem(): number {
    if (this.indicadores.totalProdutos === 0) {
      return 0;
    }

    return Math.round((this.indicadores.produtosComImagem / this.indicadores.totalProdutos) * 100);
  }

  percentualEstoqueCritico(): number {
    if (this.indicadores.totalProdutos === 0) {
      return 0;
    }

    const criticos = this.indicadores.baixoEstoque + this.indicadores.semEstoque;
    return Math.round((criticos / this.indicadores.totalProdutos) * 100);
  }

  private calcularIndicadores(): void {
    const vendas = this.calcularVendasLocais();

    const totalProdutos = this.produtos.length;

    const estoqueTotal = this.produtos.reduce((total, produto) => {
      return total + Number(produto.estoque || 0);
    }, 0);

    const valorEmEstoque = this.produtos.reduce((total, produto) => {
      const preco = Number(produto.preco || 0);
      const estoque = Number(produto.estoque || 0);
      return total + (preco * estoque);
    }, 0);

    const baixoEstoque = this.produtos.filter(produto => {
      const estoque = Number(produto.estoque || 0);
      return estoque > 0 && estoque <= 5;
    }).length;

    const semEstoque = this.produtos.filter(produto => {
      return Number(produto.estoque || 0) <= 0;
    }).length;

    const produtosComImagem = this.produtos.filter(produto => {
      return !!this.getFidProduto(produto) || !!produto.imagemUrl;
    }).length;

    this.indicadores = {
      totalProdutos,
      estoqueTotal,
      valorEmEstoque,
      baixoEstoque,
      semEstoque,
      produtosComImagem,
      valorVendido: vendas.valor,
      vendasRegistradas: vendas.quantidade
    };
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

  private calcularVendasLocais(): { valor: number; quantidade: number } {
    let valor = 0;
    let quantidade = 0;

    Object.keys(localStorage).forEach((key) => {
      const chave = key.toLowerCase();

      const pareceVenda =
        chave.includes('pedido') ||
        chave.includes('compra') ||
        chave.includes('historico');

      if (!pareceVenda) {
        return;
      }

      try {
        const bruto = localStorage.getItem(key);

        if (!bruto) {
          return;
        }

        const dados = JSON.parse(bruto);
        const resumo = this.extrairResumoVenda(dados);

        valor += resumo.valor;
        quantidade += resumo.quantidade;
      } catch {
        return;
      }
    });

    return {
      valor,
      quantidade
    };
  }

  private extrairResumoVenda(dados: any): { valor: number; quantidade: number } {
    if (Array.isArray(dados)) {
      return dados.reduce(
        (total, item) => {
          const resumo = this.extrairResumoVenda(item);

          return {
            valor: total.valor + resumo.valor,
            quantidade: total.quantidade + resumo.quantidade
          };
        },
        { valor: 0, quantidade: 0 }
      );
    }

    if (!dados || typeof dados !== 'object') {
      return { valor: 0, quantidade: 0 };
    }

    const totalDireto = Number(
      dados.total ||
      dados.valorTotal ||
      dados.precoTotal ||
      dados.totalCompra ||
      0
    );

    const itens = Array.isArray(dados.itens) ? dados.itens : [];

    const totalItens = itens.reduce((soma: number, item: any) => {
      const quantidadeItem = Number(item.quantidade || 1);
      const precoItem = Number(item.preco || item.produto?.preco || 0);
      const subtotalItem = Number(item.subtotal || item.total || 0);

      return soma + (subtotalItem > 0 ? subtotalItem : quantidadeItem * precoItem);
    }, 0);

    const valor = totalDireto > 0 ? totalDireto : totalItens;

    if (valor <= 0) {
      return { valor: 0, quantidade: 0 };
    }

    return {
      valor,
      quantidade: 1
    };
  }
}