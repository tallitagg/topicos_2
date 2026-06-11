import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CarrinhoService, ItemCarrinho } from '../../services/carrinho.service';
import { ListaDesejosService } from '../../services/lista-desejos.service';
import { Produto } from '../../models/produto';

type FormaPagamento = 'PIX' | 'BOLETO' | 'CARTAO_CREDITO';

@Component({
  selector: 'app-finalizar-compra',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './finalizar-compra.html',
  styleUrl: './finalizar-compra.css'
})
export class FinalizarCompraComponent implements OnInit {

  etapaAtual = 1;

  form: FormGroup;
  itens: ItemCarrinho[] = [];

  codigoPix = '';
  linhaBoleto = '';
  vencimentoBoleto = '';

  constructor(
    private fb: FormBuilder,
    private carrinhoService: CarrinhoService,
    private desejosService: ListaDesejosService,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      telefone: ['', [Validators.required, Validators.minLength(10)]],
      cep: ['', [Validators.required, Validators.minLength(8)]],
      rua: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      complemento: [''],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required, Validators.maxLength(2)]],

      pagamento: ['PIX', [Validators.required]],

      nomeCartao: [''],
      numeroCartao: [''],
      validadeCartao: [''],
      cvvCartao: [''],
      parcelas: ['1']
    });

    this.form.get('pagamento')?.valueChanges.subscribe((valor: FormaPagamento) => {
      this.configurarValidacoesPagamento(valor);
      this.gerarDadosPagamento(valor);
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);

    this.itens = this.carrinhoService.listar();

    if (this.itens.length === 0) {
      this.exibirMensagem('Seu carrinho está vazio.');
      this.router.navigateByUrl('/catalogo');
      return;
    }

    this.gerarDadosPagamento(this.form.value.pagamento);
    this.configurarValidacoesPagamento(this.form.value.pagamento);
  }

  configurarValidacoesPagamento(tipo: FormaPagamento): void {
    const nomeCartao = this.form.get('nomeCartao');
    const numeroCartao = this.form.get('numeroCartao');
    const validadeCartao = this.form.get('validadeCartao');
    const cvvCartao = this.form.get('cvvCartao');
    const parcelas = this.form.get('parcelas');

    nomeCartao?.clearValidators();
    numeroCartao?.clearValidators();
    validadeCartao?.clearValidators();
    cvvCartao?.clearValidators();
    parcelas?.clearValidators();

    if (tipo === 'CARTAO_CREDITO') {
      nomeCartao?.setValidators([Validators.required, Validators.minLength(3)]);
      numeroCartao?.setValidators([Validators.required, Validators.minLength(13)]);
      validadeCartao?.setValidators([Validators.required, Validators.minLength(5)]);
      cvvCartao?.setValidators([Validators.required, Validators.minLength(3)]);
      parcelas?.setValidators([Validators.required]);
    }

    nomeCartao?.updateValueAndValidity();
    numeroCartao?.updateValueAndValidity();
    validadeCartao?.updateValueAndValidity();
    cvvCartao?.updateValueAndValidity();
    parcelas?.updateValueAndValidity();
  }

  irParaPagamento(): void {
    if (!this.enderecoValido()) {
      this.marcarCamposEndereco();
      this.exibirMensagem('Preencha os dados de entrega para continuar.');
      return;
    }

    this.etapaAtual = 2;
    window.scrollTo(0, 0);
  }

  irParaRevisao(): void {
    const pagamento = this.form.value.pagamento as FormaPagamento;

    if (pagamento === 'CARTAO_CREDITO') {
      const camposCartao = ['nomeCartao', 'numeroCartao', 'validadeCartao', 'cvvCartao', 'parcelas'];

      const cartaoInvalido = camposCartao.some(campo => this.form.get(campo)?.invalid);

      if (cartaoInvalido) {
        camposCartao.forEach(campo => this.form.get(campo)?.markAsTouched());
        this.exibirMensagem('Preencha os dados do cartão.');
        return;
      }
    }

    this.etapaAtual = 3;
    window.scrollTo(0, 0);
  }

  voltarEtapa(): void {
    if (this.etapaAtual > 1) {
      this.etapaAtual -= 1;
      window.scrollTo(0, 0);
    }
  }

  confirmarCompra(): void {
    if (!this.enderecoValido()) {
      this.etapaAtual = 1;
      this.marcarCamposEndereco();
      this.exibirMensagem('Confira os dados de entrega.');
      return;
    }

    const pagamento = this.form.value.pagamento as FormaPagamento;

    if (pagamento === 'CARTAO_CREDITO') {
      const camposCartao = ['nomeCartao', 'numeroCartao', 'validadeCartao', 'cvvCartao', 'parcelas'];
      const cartaoInvalido = camposCartao.some(campo => this.form.get(campo)?.invalid);

      if (cartaoInvalido) {
        this.etapaAtual = 2;
        camposCartao.forEach(campo => this.form.get(campo)?.markAsTouched());
        this.exibirMensagem('Confira os dados do cartão.');
        return;
      }
    }

    const pedido = {
      id: Date.now(),
      data: new Date().toISOString(),
      statusPedido: 'Confirmado',
      statusPagamento: this.statusPagamento(),
      endereco: {
        nome: this.form.value.nome,
        telefone: this.form.value.telefone,
        cep: this.form.value.cep,
        rua: this.form.value.rua,
        numero: this.form.value.numero,
        complemento: this.form.value.complemento,
        bairro: this.form.value.bairro,
        cidade: this.form.value.cidade,
        estado: this.form.value.estado
      },
      pagamento: {
        forma: pagamento,
        codigoPix: pagamento === 'PIX' ? this.codigoPix : null,
        linhaBoleto: pagamento === 'BOLETO' ? this.linhaBoleto : null,
        vencimentoBoleto: pagamento === 'BOLETO' ? this.vencimentoBoleto : null,
        parcelas: pagamento === 'CARTAO_CREDITO' ? this.form.value.parcelas : null,
        finalCartao: pagamento === 'CARTAO_CREDITO'
          ? this.pegarFinalCartao(this.form.value.numeroCartao)
          : null
      },
      itens: this.itens,
      subtotal: this.subtotal(),
      frete: this.frete(),
      desconto: this.desconto(),
      total: this.total()
    };

    localStorage.setItem('ultimoPedido', JSON.stringify(pedido));

    const historico = JSON.parse(localStorage.getItem('historicoPedidos') || '[]');
    historico.push(pedido);
    localStorage.setItem('historicoPedidos', JSON.stringify(historico));

    this.carrinhoService.limpar();

    this.exibirMensagem('Compra finalizada com sucesso!');
    this.router.navigateByUrl('/resumo-compra');
  }

  enderecoValido(): boolean {
    const campos = ['nome', 'telefone', 'cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];
    return campos.every(campo => this.form.get(campo)?.valid);
  }

  marcarCamposEndereco(): void {
    const campos = ['nome', 'telefone', 'cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];
    campos.forEach(campo => this.form.get(campo)?.markAsTouched());
  }

  gerarDadosPagamento(tipo: FormaPagamento): void {
    if (tipo === 'PIX') {
      this.codigoPix = this.gerarCodigoPix();
    }

    if (tipo === 'BOLETO') {
      this.linhaBoleto = this.gerarLinhaBoleto();
      this.vencimentoBoleto = this.gerarVencimentoBoleto();
    }
  }

  gerarCodigoPix(): string {
    const numero = Math.floor(100000000000 + Math.random() * 900000000000);
    return `00020126580014BR.GOV.BCB.PIX0136EGARRAFAS-${numero}520400005303986540${this.total().toFixed(2)}5802BR5925E-GARRAFAS PREMIUM6006PALMAS62070503***6304ABCD`;
  }

  gerarLinhaBoleto(): string {
    const parte1 = Math.floor(10000 + Math.random() * 89999);
    const parte2 = Math.floor(10000 + Math.random() * 89999);
    const parte3 = Math.floor(10000 + Math.random() * 89999);
    const valor = Math.round(this.total() * 100).toString().padStart(10, '0');

    return `23790.${parte1} 60000.${parte2} 00000.${parte3} 1 9876${valor}`;
  }

  gerarVencimentoBoleto(): string {
    const data = new Date();
    data.setDate(data.getDate() + 3);

    return data.toLocaleDateString('pt-BR');
  }

  copiarTexto(texto: string): void {
    navigator.clipboard.writeText(texto).then(() => {
      this.exibirMensagem('Código copiado com sucesso!');
    }).catch(() => {
      this.exibirMensagem('Não foi possível copiar automaticamente.');
    });
  }

  statusPagamento(): string {
    const pagamento = this.form.value.pagamento as FormaPagamento;

    if (pagamento === 'CARTAO_CREDITO') {
      return 'Pago';
    }

    return 'Aguardando pagamento';
  }

  nomePagamento(): string {
    const pagamento = this.form.value.pagamento as FormaPagamento;

    if (pagamento === 'PIX') {
      return 'PIX';
    }

    if (pagamento === 'BOLETO') {
      return 'Boleto bancário';
    }

    return 'Cartão de crédito';
  }

  pegarFinalCartao(numero: string): string {
    const limpo = (numero || '').replace(/\D/g, '');
    return limpo.slice(-4);
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

  getImagemProduto(produto: Produto): string | null {
    return produto.imagemUrl && produto.imagemUrl.trim()
      ? produto.imagemUrl
      : null;
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  campoInvalido(campo: string): boolean {
    const control: AbstractControl | null = this.form.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  etapaConcluida(etapa: number): boolean {
    return this.etapaAtual > etapa;
  }

  etapaAtiva(etapa: number): boolean {
    return this.etapaAtual === etapa;
  }

  private exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}