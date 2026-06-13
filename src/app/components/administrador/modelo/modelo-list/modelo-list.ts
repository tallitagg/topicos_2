import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table';
import { Modelo } from '../../../../models/modelo';
import { ModeloService } from '../../../../services/modelo.service';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-modelo-list',
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
  templateUrl: './modelo-list.html',
  styleUrl: './modelo-list.css',
})
export class ModeloList implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['numero', 'nome', 'anoLancamento', 'acao'];
  dataSource = new MatTableDataSource<Modelo>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private modeloService: ModeloService) {}

  ngOnInit(): void {
    this.buscar();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  buscar(): void {
    this.modeloService.findAll().subscribe(data => {
      this.dataSource.data = data;

      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });
  }

applyFilter(event: Event): void {
  const valor = (event.target as HTMLInputElement).value.trim();

  if (valor) {
    this.modeloService.findByNome(valor).subscribe(data => {
      this.dataSource.data = data;

      if (this.paginator) {
        this.paginator.firstPage();
      }
    });
  } else {
    this.buscar();
  }
}

  excluir(id: number): void {
    this.modeloService.delete(id).subscribe({
      next: () => this.buscar(),
      error: () => alert('Não é possível excluir este modelo, pois ele está vinculado a um produto.')
    });
  }
}