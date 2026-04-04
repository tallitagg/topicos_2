import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarcaService } from '../../../services/marca.service';
import { Marca } from '../../../models/marca';

@Component({
  selector: 'app-marca-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marca-list.html',
  styleUrls: ['./marca-list.css']
})
export class MarcaListComponent implements OnInit {
  filtro: string = '';
  itens: Marca[] = [];
  itensFiltrados: Marca[] = [];
  loading: boolean = false;
  mostrarModal: boolean = false;
  modalTitulo: string = '';
  editando: boolean = false;
  marcaEdit: Marca = { id: 0, nome: '' };

  constructor(private marcaService: MarcaService) {}

  ngOnInit() {
    this.carregarMarcas();
  }

  carregarMarcas() {
    this.loading = true;
    this.marcaService.getMarcas().subscribe({
      next: (data: Marca[]) => {
        this.itens = data;
        this.itensFiltrados = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erro:', err);
        this.loading = false;
      }
    });
  }

  // Corrigido para garantir que id é number
  excluir(id: number | undefined) {
    if (!id) {
      alert('ID inválido');
      return;
    }
    
    if (confirm('Tem certeza que deseja excluir esta marca?')) {
      this.loading = true;
      this.marcaService.deleteMarca(id).subscribe({
        next: () => {
          this.carregarMarcas();
        },
        error: (err: any) => {
          console.error('Erro ao excluir:', err);
          alert('Erro ao excluir marca');
          this.loading = false;
        }
      });
    }
  }

  filtrarMarcas() {
    if (!this.filtro) {
      this.itensFiltrados = [...this.itens];
    } else {
      this.itensFiltrados = this.itens.filter(item => 
        item.nome.toLowerCase().includes(this.filtro.toLowerCase())
      );
    }
  }

  limparFiltro() {
    this.filtro = '';
    this.filtrarMarcas();
  }

  novoItem() {
    this.editando = false;
    this.modalTitulo = 'Nova Marca';
    this.marcaEdit = { id: 0, nome: '' };
    this.mostrarModal = true;
  }

  editar(item: Marca) {
    this.editando = true;
    this.modalTitulo = 'Editar Marca';
    this.marcaEdit = { ...item };
    this.mostrarModal = true;
  }

  salvarMarca() {
    if (!this.marcaEdit.nome) {
      alert('Por favor, informe o nome da marca');
      return;
    }

    this.loading = true;
    
    if (this.editando) {
      if (!this.marcaEdit.id) {
        alert('ID inválido');
        this.loading = false;
        return;
      }
      
      this.marcaService.alterarMarca(this.marcaEdit.id, { nome: this.marcaEdit.nome }).subscribe({
        next: () => {
          this.carregarMarcas();
          this.mostrarModal = false;
        },
        error: (err: any) => {
          console.error(err);
          alert('Erro ao atualizar marca');
          this.loading = false;
        }
      });
    } else {
      this.marcaService.incluirMarca({ nome: this.marcaEdit.nome }).subscribe({
        next: () => {
          this.carregarMarcas();
          this.mostrarModal = false;
        },
        error: (err: any) => {
          console.error(err);
          alert('Erro ao criar marca');
          this.loading = false;
        }
      });
    }
  }

  fecharModal(event?: MouseEvent) {
    if (!event || (event.target as HTMLElement).classList.contains('modal')) {
      this.mostrarModal = false;
    }
  }
}