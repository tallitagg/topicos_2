import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table';
import { Produto } from '../../../models/produto';
import { ProdutoService } from '../../../services/produto.service';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-produto-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatFormFieldModule,
    MatTableModule,
    MatIcon,
    MatInputModule,
    MatPaginatorModule
  ],
  templateUrl: './produto-list.html',
  styleUrl: './produto-list.css',
})
export class ProdutoList implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['numero', 'nome', 'preco', 'estoque', 'marca', 'modelo', 'acao'];
  dataSource = new MatTableDataSource<Produto>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private produtoService: ProdutoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buscar();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;

this.dataSource.filterPredicate = (data: Produto, filter: string): boolean => {
  const texto = filter.trim().toLowerCase();

  return (
    (data.nome?.toLowerCase().includes(texto) ?? false) ||
    (data.marca?.nome?.toLowerCase().includes(texto) ?? false) ||
    (data.modelo?.nome?.toLowerCase().includes(texto) ?? false)
  );
};
  }

  buscar(): void {
    this.produtoService.findAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      },
      error: () => {
        alert('Erro ao carregar produtos.');
      }
    });
  }

  applyFilter(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

editar(id: number | undefined): void {
  if (id != null) {
    this.router.navigate(['/produtos/edit', id]);
  }
}

  excluir(id: number | undefined): void {
    if (id != null) {
      this.produtoService.delete(id).subscribe({
        next: () => this.buscar(),
        error: () => alert('Erro ao excluir produto.')
      });
    }
  }
}