import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table';
import { Marca } from '../../../models/marca';
import { MarcaService } from '../../../services/marca.service';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-marca-list',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatFormFieldModule,
    MatTableModule,
    MatIcon,
    MatInputModule,
    MatPaginatorModule
  ],
  templateUrl: './marca-list.html',
  styleUrl: './marca-list.css',
})
export class MarcaList implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['numero', 'nome', 'acao'];
  dataSource = new MatTableDataSource<Marca>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private marcaService: MarcaService) {}

  ngOnInit(): void {
    this.buscar();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  buscar(): void {
    this.marcaService.findAll().subscribe(data => {
      this.dataSource.data = data;

      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
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

  excluir(id: number): void {
    this.marcaService.delete(id).subscribe({
      next: () => this.buscar(),
      error: () => alert('Erro ao excluir marca.')
    });
  }
}