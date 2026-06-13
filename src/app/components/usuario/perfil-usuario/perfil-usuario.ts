import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CarrinhoService } from '../../../services/carrinho.service';
import { ListaDesejosService } from '../../../services/lista-desejos.service';
import { EcommerceAuthService } from '../../../services/ecommerce-auth.service';

type AbaPerfil = 'conta' | 'pedidos' | 'enderecos' | 'pagamentos';

interface EnderecoCliente {
  id: number;
  tipo: 'Casa' | 'Trabalho' | 'Outro';
  principal: boolean;
  nome: string;
  telefone: string;
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface PagamentoCliente {
  id: number;
  tipo: 'Cartão' | 'PIX' | 'Boleto';
  apelido: string;
  titular?: string;
  finalCartao?: string;
  principal: boolean;
}

interface PedidoHistorico {
  id: number;
  data: string;
  statusPedido?: string;
  statusPagamento?: string;
  endereco: any;
  pagamento: any;
  itens: any[];
  subtotal: number;
  frete: number;
  desconto: number;
  total: number;
}

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css'
})
export class PerfilUsuarioComponent implements OnInit {

  abaAtiva: AbaPerfil = 'conta';

  perfilForm: FormGroup;
  senhaForm: FormGroup;
  enderecoForm: FormGroup;
  pagamentoForm: FormGroup;

  enderecos: EnderecoCliente[] = [];
  pagamentos: PagamentoCliente[] = [];
  compras: PedidoHistorico[] = [];

  pedidoAbertoId: number | null = null;

  carregandoPerfil = false;
  salvandoPerfil = false;
  alterandoSenha = false;

  private get perfilKey(): string {
  return this.chaveUsuario('perfilCliente');
}

private get enderecosKey(): string {
  return this.chaveUsuario('enderecosCliente');
}

private get pagamentosKey(): string {
  return this.chaveUsuario('pagamentosCliente');
}

private get historicoKey(): string {
  return this.chaveUsuario('historicoPedidos');
}

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar,
    private authService: EcommerceAuthService,
    private carrinhoService: CarrinhoService,
    private desejosService: ListaDesejosService
  ) {
    this.perfilForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.minLength(10)]],
      cpf: ['', [Validators.required, Validators.minLength(11)]],
      senhaConfirmacaoPerfil: ['', [Validators.required]]
    });

    this.senhaForm = this.fb.group(
      {
        senhaAtual: ['', [Validators.required, Validators.minLength(3)]],
        novaSenha: ['', [Validators.required, Validators.minLength(3)]],
        confirmarSenha: ['', [Validators.required, Validators.minLength(3)]]
      },
      {
        validators: [
          this.senhasIguaisValidator,
          this.novaSenhaDiferenteValidator
        ]
      }
    );

    this.enderecoForm = this.fb.group({
      tipo: ['Casa', [Validators.required]],
      principal: [false],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      telefone: ['', [Validators.required, Validators.minLength(10)]],
      cep: ['', [Validators.required, Validators.minLength(8)]],
      rua: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      complemento: [''],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required, Validators.maxLength(2)]]
    });

    this.pagamentoForm = this.fb.group({
      tipo: ['Cartão', [Validators.required]],
      apelido: ['', [Validators.required]],
      titular: [''],
      numeroCartao: [''],
      principal: [false]
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);

    this.carregarPerfil();
    this.carregarCompras();
    this.carregarEnderecos();
    this.carregarPagamentos();

    this.route.queryParamMap.subscribe(params => {
      const secao = params.get('secao');

      if (secao === 'compras' || secao === 'pedidos') {
        this.abaAtiva = 'pedidos';
      }
    });
  }

  senhasIguaisValidator(control: AbstractControl): ValidationErrors | null {
    const novaSenha = control.get('novaSenha')?.value;
    const confirmarSenha = control.get('confirmarSenha')?.value;

    if (!novaSenha || !confirmarSenha) {
      return null;
    }

    return novaSenha === confirmarSenha ? null : { senhasDiferentes: true };
  }

  novaSenhaDiferenteValidator(control: AbstractControl): ValidationErrors | null {
    const senhaAtual = control.get('senhaAtual')?.value;
    const novaSenha = control.get('novaSenha')?.value;

    if (!senhaAtual || !novaSenha) {
      return null;
    }

    return senhaAtual !== novaSenha ? null : { novaSenhaIgualAtual: true };
  }

  estaLogado(): boolean {
    return this.authService.logado();
  }

  carregarPerfil(): void {
    if (!this.authService.logado()) {
      this.carregarPerfilLocal();
      return;
    }

    this.carregandoPerfil = true;

    this.authService.buscarMeuPerfil().subscribe({
      next: (cliente) => {
        this.carregandoPerfil = false;

        this.perfilForm.patchValue({
          nome: cliente.usuario.nome,
          username: cliente.usuario.username,
          email: cliente.usuario.email,
          telefone: cliente.usuario.telefone,
          cpf: cliente.cpf,
          senhaConfirmacaoPerfil: ''
        });

        this.salvarPerfilLocal();
      },
      error: () => {
        this.carregandoPerfil = false;
        this.carregarPerfilLocal();
        this.exibirMensagem('NÃ£o foi possÃ­vel carregar o perfil. FaÃ§a login novamente.');
      }
    });
  }

  carregarPerfilLocal(): void {
    const perfilSalvo = this.buscarJson(this.perfilKey);

    if (perfilSalvo) {
      this.perfilForm.patchValue({
        nome: perfilSalvo.nome,
        username: perfilSalvo.username,
        email: perfilSalvo.email,
        telefone: perfilSalvo.telefone,
        cpf: perfilSalvo.cpf,
        senhaConfirmacaoPerfil: ''
      });

      return;
    }

    this.perfilForm.patchValue({
      nome: 'Cliente E-Garrafas',
      username: 'maria.santos',
      email: 'cliente@egarrafas.com.br',
      telefone: '(63) 99999-9999',
      cpf: '000.000.000-00',
      senhaConfirmacaoPerfil: ''
    });
  }

  salvarPerfil(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      this.exibirMensagem('Preencha os dados e confirme com sua senha.');
      return;
    }

    if (!this.authService.logado()) {
      this.exibirMensagem('VocÃª precisa estar logado para alterar os dados da conta.');
      return;
    }

    this.salvandoPerfil = true;

    const dto = {
      senhaConfirmacao: this.perfilForm.value.senhaConfirmacaoPerfil,
      nome: this.perfilForm.value.nome,
      username: this.perfilForm.value.username,
      email: this.perfilForm.value.email,
      telefone: this.perfilForm.value.telefone,
      cpf: this.perfilForm.value.cpf
    };

    this.authService.atualizarPerfil(dto).subscribe({
      next: (cliente) => {
        this.salvandoPerfil = false;

        this.perfilForm.patchValue({
          nome: cliente.usuario.nome,
          username: cliente.usuario.username,
          email: cliente.usuario.email,
          telefone: cliente.usuario.telefone,
          cpf: cliente.cpf,
          senhaConfirmacaoPerfil: ''
        });

        this.salvarPerfilLocal();

        this.exibirMensagem('Dados da conta salvos com sucesso!');
      },
      error: (erro) => {
        this.salvandoPerfil = false;

        if (erro.status === 401) {
          this.exibirMensagem('Senha de confirmaÃ§Ã£o incorreta.');
          return;
        }

        if (erro.status === 409) {
          this.exibirMensagem('Este usuÃ¡rio jÃ¡ estÃ¡ em uso.');
          return;
        }

        this.exibirMensagem('NÃ£o foi possÃ­vel salvar os dados da conta.');
      }
    });
  }

  private salvarPerfilLocal(): void {
    const perfilParaSalvar = {
      nome: this.perfilForm.value.nome,
      username: this.perfilForm.value.username,
      email: this.perfilForm.value.email,
      telefone: this.perfilForm.value.telefone,
      cpf: this.perfilForm.value.cpf
    };

    localStorage.setItem(this.perfilKey, JSON.stringify(perfilParaSalvar));
  }

  alterarSenha(): void {
    this.senhaForm.updateValueAndValidity();

    if (this.senhaForm.invalid) {
      this.senhaForm.markAllAsTouched();

      if (this.senhaForm.hasError('senhasDiferentes')) {
        this.exibirMensagem('A nova senha e a confirmaÃ§Ã£o nÃ£o conferem.');
        return;
      }

      if (this.senhaForm.hasError('novaSenhaIgualAtual')) {
        this.exibirMensagem('A nova senha precisa ser diferente da senha atual.');
        return;
      }

      this.exibirMensagem('Preencha corretamente todos os campos de senha.');
      return;
    }

    if (!this.authService.logado()) {
      this.exibirMensagem('VocÃª precisa estar logado para alterar a senha.');
      return;
    }

    this.alterandoSenha = true;

    const dto = {
      senhaAtual: this.senhaForm.value.senhaAtual,
      novaSenha: this.senhaForm.value.novaSenha
    };

    this.authService.alterarSenha(dto).subscribe({
      next: () => {
        this.exibirMensagem('Senha alterada com sucesso! FaÃ§a login novamente com a nova senha.');
        this.senhaForm.reset();

        this.authService.sair();

        setTimeout(() => {
          this.alterandoSenha = false;
          this.router.navigateByUrl('/login');
        }, 800);
      },
      error: (erro) => {
        this.alterandoSenha = false;

        if (erro.status === 401) {
          this.exibirMensagem('Senha atual incorreta.');
          return;
        }

        this.exibirMensagem('NÃ£o foi possÃ­vel alterar a senha.');
      }
    });
  }

  sairDaConta(): void {
    this.authService.sair();
    this.exibirMensagem('VocÃª saiu da sua conta.');

    setTimeout(() => {
      this.router.navigateByUrl('/login');
    }, 700);
  }

  podeAlterarSenha(): boolean {
    return this.estaLogado()
      && this.senhaForm.valid
      && !this.alterandoSenha;
  }

  mostrarErroSenhaAtual(): boolean {
    const campo = this.senhaForm.get('senhaAtual');
    return !!(campo && campo.invalid && campo.touched);
  }

  mostrarErroNovaSenha(): boolean {
    const campo = this.senhaForm.get('novaSenha');
    return !!(campo && campo.invalid && campo.touched);
  }

  mostrarErroConfirmarSenha(): boolean {
    const campo = this.senhaForm.get('confirmarSenha');
    return !!(campo && campo.invalid && campo.touched);
  }

  mostrarErroSenhasDiferentes(): boolean {
    const confirmarSenha = this.senhaForm.get('confirmarSenha');
    return !!(
      this.senhaForm.hasError('senhasDiferentes')
      && confirmarSenha
      && confirmarSenha.touched
    );
  }

  mostrarErroNovaSenhaIgualAtual(): boolean {
    const novaSenha = this.senhaForm.get('novaSenha');
    return !!(
      this.senhaForm.hasError('novaSenhaIgualAtual')
      && novaSenha
      && novaSenha.touched
    );
  }

  carregarCompras(): void {
    const historico = this.buscarJson(this.historicoKey);

    this.compras = Array.isArray(historico)
      ? historico
      : [];
  }

  comprasOrdenadas(): PedidoHistorico[] {
    return [...this.compras].reverse();
  }

  alternarDetalhesPedido(id: number): void {
    this.pedidoAbertoId = this.pedidoAbertoId === id
      ? null
      : id;
  }

  comprarNovamente(pedido: PedidoHistorico): void {
    if (!pedido.itens || pedido.itens.length === 0) {
      this.exibirMensagem('Este pedido nÃ£o possui itens para comprar novamente.');
      return;
    }

    pedido.itens.forEach(item => {
      const quantidade = item.quantidade || 1;

      for (let i = 0; i < quantidade; i++) {
        if (item.produto) {
          this.carrinhoService.adicionar(item.produto);
        }
      }
    });

    this.exibirMensagem('Itens adicionados ao carrinho!');
    this.router.navigateByUrl('/carrinho');
  }

  quantidadeItensPedido(pedido: PedidoHistorico): number {
    if (!pedido.itens) {
      return 0;
    }

    return pedido.itens.reduce((total, item) => {
      return total + (item.quantidade || 0);
    }, 0);
  }

  carregarEnderecos(): void {
    const enderecosSalvos = this.buscarJson(this.enderecosKey);

    if (Array.isArray(enderecosSalvos) && enderecosSalvos.length > 0) {
      this.enderecos = this.normalizarEnderecos(enderecosSalvos);
      this.salvarEnderecos();
      return;
    }

    const enderecosDosPedidos = this.compras
      .filter(compra => !!compra.endereco)
      .map(compra => {
        return {
          id: compra.id,
          tipo: 'Casa' as const,
          principal: false,
          nome: compra.endereco.nome,
          telefone: compra.endereco.telefone,
          cep: compra.endereco.cep,
          rua: compra.endereco.rua,
          numero: compra.endereco.numero,
          complemento: compra.endereco.complemento,
          bairro: compra.endereco.bairro,
          cidade: compra.endereco.cidade,
          estado: compra.endereco.estado
        };
      });

    this.enderecos = this.removerEnderecosDuplicados(enderecosDosPedidos);

    if (this.enderecos.length > 0) {
      this.enderecos[0].principal = true;
    }

    this.salvarEnderecos();
  }

  adicionarEndereco(): void {
    if (this.enderecoForm.invalid) {
      this.enderecoForm.markAllAsTouched();
      this.exibirMensagem('Preencha os dados obrigatÃ³rios do endereÃ§o.');
      return;
    }

    const seraPrincipal = this.enderecoForm.value.principal || this.enderecos.length === 0;

    if (seraPrincipal) {
      this.enderecos = this.enderecos.map(endereco => {
        return {
          ...endereco,
          principal: false
        };
      });
    }

    const novoEndereco: EnderecoCliente = {
      id: Date.now(),
      tipo: this.enderecoForm.value.tipo,
      principal: seraPrincipal,
      nome: this.enderecoForm.value.nome,
      telefone: this.enderecoForm.value.telefone,
      cep: this.enderecoForm.value.cep,
      rua: this.enderecoForm.value.rua,
      numero: this.enderecoForm.value.numero,
      complemento: this.enderecoForm.value.complemento,
      bairro: this.enderecoForm.value.bairro,
      cidade: this.enderecoForm.value.cidade,
      estado: this.enderecoForm.value.estado
    };

    this.enderecos.push(novoEndereco);
    this.salvarEnderecos();

    this.enderecoForm.reset({
      tipo: 'Casa',
      principal: false,
      nome: '',
      telefone: '',
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    });

    this.exibirMensagem('EndereÃ§o adicionado com sucesso!');
  }

  definirEnderecoPrincipal(id: number): void {
    this.enderecos = this.enderecos.map(endereco => {
      return {
        ...endereco,
        principal: endereco.id === id
      };
    });

    this.salvarEnderecos();
    this.exibirMensagem('EndereÃ§o principal atualizado.');
  }

  removerEndereco(id: number): void {
    const enderecoRemovido = this.enderecos.find(endereco => endereco.id === id);

    this.enderecos = this.enderecos.filter(endereco => endereco.id !== id);

    if (enderecoRemovido?.principal && this.enderecos.length > 0) {
      this.enderecos[0].principal = true;
    }

    this.salvarEnderecos();
    this.exibirMensagem('EndereÃ§o removido.');
  }

  salvarEnderecos(): void {
    localStorage.setItem(this.enderecosKey, JSON.stringify(this.enderecos));
  }

  normalizarEnderecos(enderecos: any[]): EnderecoCliente[] {
    return enderecos.map((endereco, index) => {
      return {
        id: endereco.id || Date.now() + index,
        tipo: endereco.tipo || 'Casa',
        principal: endereco.principal || index === 0,
        nome: endereco.nome,
        telefone: endereco.telefone,
        cep: endereco.cep,
        rua: endereco.rua,
        numero: endereco.numero,
        complemento: endereco.complemento,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        estado: endereco.estado
      };
    });
  }

  removerEnderecosDuplicados(enderecos: EnderecoCliente[]): EnderecoCliente[] {
    const unicos: EnderecoCliente[] = [];

    enderecos.forEach(endereco => {
      const existe = unicos.some(item => {
        return item.cep === endereco.cep
          && item.rua === endereco.rua
          && item.numero === endereco.numero;
      });

      if (!existe) {
        unicos.push(endereco);
      }
    });

    return unicos;
  }

  carregarPagamentos(): void {
    const pagamentosSalvos = this.buscarJson(this.pagamentosKey);

    this.pagamentos = Array.isArray(pagamentosSalvos)
      ? pagamentosSalvos
      : [];
  }

  adicionarPagamento(): void {
    if (this.pagamentoForm.invalid) {
      this.pagamentoForm.markAllAsTouched();
      this.exibirMensagem('Preencha os dados obrigatÃ³rios do pagamento.');
      return;
    }

    const tipo = this.pagamentoForm.value.tipo;
    const numeroLimpo = String(this.pagamentoForm.value.numeroCartao || '').replace(/\D/g, '');

    if (tipo === 'Cartão' && numeroLimpo.length < 4) {
      this.exibirMensagem('Informe ao menos os Ãºltimos 4 dÃ­gitos do cartÃ£o.');
      return;
    }

    const seraPrincipal = this.pagamentoForm.value.principal || this.pagamentos.length === 0;

    if (seraPrincipal) {
      this.pagamentos = this.pagamentos.map(pagamento => {
        return {
          ...pagamento,
          principal: false
        };
      });
    }

    const novoPagamento: PagamentoCliente = {
      id: Date.now(),
      tipo,
      apelido: this.pagamentoForm.value.apelido,
      titular: this.pagamentoForm.value.titular,
      finalCartao: tipo === 'Cartão' ? numeroLimpo.slice(-4) : undefined,
      principal: seraPrincipal
    };

    this.pagamentos.push(novoPagamento);
    this.salvarPagamentos();

    this.pagamentoForm.reset({
      tipo: 'Cartão',
      apelido: '',
      titular: '',
      numeroCartao: '',
      principal: false
    });

    this.exibirMensagem('Forma de pagamento adicionada.');
  }

  definirPagamentoPrincipal(id: number): void {
    this.pagamentos = this.pagamentos.map(pagamento => {
      return {
        ...pagamento,
        principal: pagamento.id === id
      };
    });

    this.salvarPagamentos();
    this.exibirMensagem('Pagamento principal atualizado.');
  }

  removerPagamento(id: number): void {
    const pagamentoRemovido = this.pagamentos.find(pagamento => pagamento.id === id);

    this.pagamentos = this.pagamentos.filter(pagamento => pagamento.id !== id);

    if (pagamentoRemovido?.principal && this.pagamentos.length > 0) {
      this.pagamentos[0].principal = true;
    }

    this.salvarPagamentos();
    this.exibirMensagem('Forma de pagamento removida.');
  }

  salvarPagamentos(): void {
    localStorage.setItem(this.pagamentosKey, JSON.stringify(this.pagamentos));
  }

  abrirAba(aba: AbaPerfil): void {
    this.abaAtiva = aba;

    if (aba === 'pedidos') {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          secao: 'pedidos'
        }
      });

      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  totalCompras(): number {
    return this.compras.reduce((total, pedido) => {
      return total + pedido.total;
    }, 0);
  }

  quantidadeCarrinho(): number {
    return this.carrinhoService.quantidadeTotal();
  }

  quantidadeDesejos(): number {
    return this.desejosService.quantidadeTotal();
  }

  nomePagamento(forma: string): string {
    if (forma === 'PIX') {
      return 'PIX';
    }

    if (forma === 'BOLETO') {
      return 'Boleto bancário';
    }

    if (forma === 'CARTAO_CREDITO') {
      return 'Cartão de crédito';
    }

    return forma || 'Pagamento';
  }

  statusClasse(status?: string): string {
    if (status === 'Pago') {
      return 'paid';
    }

    if (status === 'Aguardando pagamento') {
      return 'waiting';
    }

    return 'confirmed';
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleString('pt-BR');
  }

  campoInvalido(form: FormGroup, campo: string): boolean {
    const control = form.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  irParaCatalogo(): void {
    this.router.navigateByUrl('/catalogo');
  }

  irParaLogin(): void {
    this.router.navigateByUrl('/login');
  }

  private chaveUsuario(base: string): string {
  const username = this.authService.getUsernameLogado() || 'visitante';
  const usernameNormalizado = encodeURIComponent(username.trim().toLowerCase());

  return `${base}_${usernameNormalizado}`;
}

  private buscarJson(chave: string): any {
    try {
      return JSON.parse(localStorage.getItem(chave) || 'null');
    } catch {
      return null;
    }
  }

  private exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
