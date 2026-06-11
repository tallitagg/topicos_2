import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table';
import { Material } from '../../../models/material';
import { MaterialService } from '../../../services/material.service';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-material-list',
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
  templateUrl: './material-list.html',
  styleUrl: './material-list.css',
})
export class MaterialList implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['numero', 'tipo', 'resistenciaTemperatura', 'acao'];
  dataSource = new MatTableDataSource<Material>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private materialService: MaterialService) {}

  ngOnInit(): void {
    this.buscar();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  buscar(): void {
    this.materialService.findAll().subscribe(data => {
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

  excluir(id: number | undefined): void {
    if (id != null) {
      this.materialService.delete(id).subscribe({
        next: () => this.buscar(),
        error: () => alert('Erro ao excluir material.')
      });
    }
  }
}