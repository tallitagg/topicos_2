import {Component, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import {Marca, MarcaDTO, MarcaService} from "../../../services/marca.service";

@Component({
    selector: 'app-marcas',
    templateUrl: './marca-list.html',
    styleUrl: './marca-list.css',
    imports: [
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        RouterLink
    ]
})
export class MarcaList implements OnInit {
    displayedColumns: string[] = ['id', 'nome', 'actions'];
    dataSource = new MatTableDataSource<Marca>([]);
    novaMarca: MarcaDTO = { nome: '' };

    constructor(private service: MarcaService) {}

    ngOnInit(): void {
        this.loadMarcas();
    }

    loadMarcas(): void {
        this.service.getMarcas().subscribe(marcas => {
            this.dataSource.data = marcas;
        });
    }
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    editarMarca(marca: Marca) {
        console.log('Editar marca:', marca);
    }

    deleteMarca(id: number) {
        this.service.deleteMarca(id).subscribe(() => this.loadMarcas());
    }

}