import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table';
import { Cor } from '../../../../models/cor';
import { CorService } from '../../../../services/cor.service';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-cor-list',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatFormFieldModule,
    MatTableModule,
    MatIcon,
    MatInputModule,
    MatPaginatorModule
  ],
  templateUrl: './cor-list.html',
  styleUrl: './cor-list.css',
})
export class CorList implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['numero', 'nome', 'codigoHex', 'acao'];
  dataSource = new MatTableDataSource<Cor>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private corService: CorService) {}

  ngOnInit(): void {
    this.buscar();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  buscar(): void {
    this.corService.findAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      },
      error: () => {
        alert('Erro ao carregar cores.');
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

  excluir(id: number | undefined): void {
    if (id != null) {
      this.corService.delete(id).subscribe({
        next: () => this.buscar(),
        error: () => alert('Erro ao excluir cor.')
      });
    }
  }
}