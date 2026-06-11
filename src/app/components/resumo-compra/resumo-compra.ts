import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-resumo-compra',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule
  ],
  templateUrl: './resumo-compra.html',
  styleUrl: './resumo-compra.css'
})
export class ResumoCompraComponent implements OnInit {

  pedido: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);

    this.pedido = JSON.parse(localStorage.getItem('ultimoPedido') || 'null');

    if (!this.pedido) {
      this.router.navigateByUrl('/catalogo');
    }
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

  nomePagamento(): string {
    const forma = this.pedido?.pagamento?.forma;

    if (forma === 'PIX') {
      return 'PIX';
    }

    if (forma === 'BOLETO') {
      return 'Boleto bancário';
    }

    if (forma === 'CARTAO_CREDITO') {
      return 'Cartão de crédito';
    }

    return 'Pagamento';
  }
}