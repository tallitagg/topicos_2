import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, forkJoin, of, switchMap } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import { Produto } from '../../../models/produto';

import { ProdutoService } from '../../../services/produto.service';
import { MarcaService } from '../../../services/marca.service';
import { ModeloService } from '../../../services/modelo.service';
import { MaterialService } from '../../../services/material.service';
import { CorService } from '../../../services/cor.service';
import { TipoTampaService } from '../../../services/tipo-tampa.service';
import { TipoIsolamentoService } from '../../../services/tipo-isolamento';

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatToolbarModule
  ],
  templateUrl: './produto-form.html',
  styleUrl: './produto-form.css'
})
export class ProdutoForm implements OnInit {

  form: FormGroup;

  produto: Produto | null = null;

  marcas: any[] = [];
  modelos: any[] = [];
  materiais: any[] = [];
  cores: any[] = [];
  tipoTampas: any[] = [];
  tiposTampa: any[] = [];
  tipoIsolamentos: any[] = [];
  tiposIsolamento: any[] = [];

  arquivoSelecionado: File | null = null;
  previewImagem: string | null = null;

  salvando = false;
  enviandoImagem = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private produtoService: ProdutoService,
    private marcaService: MarcaService,
    private modeloService: ModeloService,
    private materialService: MaterialService,
    private corService: CorService,
    private tipoTampaService: TipoTampaService,
    private tipoIsolamentoService: TipoIsolamentoService
  ) {
    this.form = this.formBuilder.group({
      id: [null],
      nome: ['', [Validators.required, Validators.minLength(2)]],
      descricao: ['', [Validators.required]],
      preco: [null, [Validators.required, Validators.min(0.01)]],
      capacidade: [null, [Validators.required, Validators.min(0.01)]],
      estoque: [null, [Validators.required, Validators.min(0)]],

      marcaId: [null, [Validators.required]],
      modeloId: [null, [Validators.required]],
      materialId: [null, [Validators.required]],
      tipoTampaId: [null, [Validators.required]],
      tipoIsolamentoId: [null, [Validators.required]],
      corIds: [[], [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.carregarCombos();
    this.carregarProdutoRota();
  }

  carregarCombos(): void {
    forkJoin({
      marcas: this.marcaService.findAll(),
      modelos: this.modeloService.findAll(),
      materiais: this.materialService.findAll(),
      cores: this.corService.findAll(),
      tipoTampas: this.tipoTampaService.findAll(),
      tipoIsolamentos: this.tipoIsolamentoService.findAll()
    }).subscribe({
      next: (dados) => {
        this.marcas = dados.marcas || [];
        this.modelos = dados.modelos || [];
        this.materiais = dados.materiais || [];
        this.cores = dados.cores || [];
        this.tipoTampas = dados.tipoTampas || [];
        this.tiposTampa = dados.tipoTampas || [];
        this.tipoIsolamentos = dados.tipoIsolamentos || [];
        this.tiposIsolamento = dados.tipoIsolamentos || [];
      },
      error: () => {
        this.exibirMensagem('Não foi possível carregar os dados auxiliares do produto.');
      }
    });
  }

  carregarProdutoRota(): void {
    const produtoResolver = this.activatedRoute.snapshot.data['produto'];

    if (produtoResolver) {
      this.produto = produtoResolver;
      this.preencherFormulario(produtoResolver);
      return;
    }

    const id = this.activatedRoute.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.produtoService.findById(id).subscribe({
      next: (produto) => {
        this.produto = produto;
        this.preencherFormulario(produto);
      },
      error: () => {
        this.exibirMensagem('Não foi possível carregar o produto.');
      }
    });
  }

  preencherFormulario(produto: Produto): void {
    this.form.patchValue({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      capacidade: produto.capacidade,
      estoque: produto.estoque,

      marcaId: produto.marcaId || produto.marca?.id || null,
      modeloId: produto.modeloId || produto.modelo?.id || null,
      materialId: produto.materialId || produto.material?.id || null,
      tipoTampaId: produto.tipoTampaId || produto.tipoTampa?.id || null,
      tipoIsolamentoId: produto.tipoIsolamentoId || produto.tipoIsolamento?.id || null,
      corIds: produto.corIds || produto.cores?.map(cor => cor.id) || []
    });

    this.previewImagem = this.imagemProduto(produto);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.exibirMensagem('Preencha corretamente os dados do produto.');
      return;
    }

    this.salvando = true;

    const produto = this.montarProduto();

    let resultado: Observable<Produto | void>;

    if (produto.id) {
      resultado = this.produtoService.update(produto);
    } else {
      resultado = this.produtoService.create(produto);
    }

    resultado
      .pipe(
        switchMap((produtoSalvo) => {
          const idProduto = produto.id || produtoSalvo?.id;

          if (this.arquivoSelecionado && idProduto) {
            return this.produtoService.uploadImagem(idProduto, this.arquivoSelecionado);
          }

          return of(null);
        })
      )
      .subscribe({
        next: () => {
          this.salvando = false;
          this.exibirMensagem('Produto salvo com sucesso!');
          this.router.navigateByUrl('/produtos');
        },
        error: () => {
          this.salvando = false;
          this.exibirMensagem('Erro ao salvar produto.');
        }
      });
  }

  montarProduto(): Produto {
    return {
      id: this.form.value.id,
      nome: this.form.value.nome,
      descricao: this.form.value.descricao,
      preco: Number(this.form.value.preco),
      capacidade: Number(this.form.value.capacidade),
      estoque: Number(this.form.value.estoque),

      marcaId: Number(this.form.value.marcaId),
      modeloId: Number(this.form.value.modeloId),
      materialId: Number(this.form.value.materialId),
      tipoTampaId: Number(this.form.value.tipoTampaId),
      tipoIsolamentoId: Number(this.form.value.tipoIsolamentoId),
      corIds: this.form.value.corIds || []
    };
  }

  selecionarImagem(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const arquivo = input.files[0];

    if (!arquivo.type.startsWith('image/')) {
      this.exibirMensagem('Selecione um arquivo de imagem.');
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      this.exibirMensagem('A imagem deve ter no máximo 5MB.');
      return;
    }

    this.arquivoSelecionado = arquivo;

    const reader = new FileReader();

    reader.onload = () => {
      this.previewImagem = reader.result as string;
    };

    reader.readAsDataURL(arquivo);
  }

  onFileSelected(event: Event): void {
    this.selecionarImagem(event);
  }

  enviarImagem(): void {
    const idProduto = this.form.value.id;

    if (!idProduto) {
      this.exibirMensagem('Salve o produto antes de enviar a imagem.');
      return;
    }

    if (!this.arquivoSelecionado) {
      this.exibirMensagem('Selecione uma imagem para enviar.');
      return;
    }

    this.enviandoImagem = true;

    this.produtoService.uploadImagem(idProduto, this.arquivoSelecionado).subscribe({
      next: () => {
        this.enviandoImagem = false;
        this.arquivoSelecionado = null;
        this.exibirMensagem('Imagem enviada com sucesso!');
        this.recarregarProduto(idProduto);
      },
      error: () => {
        this.enviandoImagem = false;
        this.exibirMensagem('Erro ao enviar imagem.');
      }
    });
  }

  removerImagem(fid: string): void {
    if (!fid) {
      return;
    }

    this.produtoService.removerImagem(fid).subscribe({
      next: () => {
        this.exibirMensagem('Imagem removida com sucesso.');

        const idProduto = this.form.value.id;

        if (idProduto) {
          this.recarregarProduto(idProduto);
        }
      },
      error: () => {
        this.exibirMensagem('Erro ao remover imagem.');
      }
    });
  }

  recarregarProduto(idProduto: number): void {
    this.produtoService.findById(idProduto).subscribe({
      next: (produto) => {
        this.produto = produto;
        this.preencherFormulario(produto);
      },
      error: () => {
        this.previewImagem = null;
      }
    });
  }

  imagemProduto(produto: Produto | null): string | null {
    if (!produto) {
      return null;
    }

    if (produto.imagens && produto.imagens.length > 0 && produto.imagens[0].fid) {
      return this.produtoService.urlImagem(produto.imagens[0].fid);
    }

    if (produto.imagemUrl) {
      return produto.imagemUrl;
    }

    return null;
  }

  getImagemProduto(produto: Produto | null): string | null {
    return this.imagemProduto(produto);
  }

  cancelar(): void {
    this.router.navigateByUrl('/produtos');
  }

  voltar(): void {
    this.cancelar();
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  private exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}