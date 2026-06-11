import { Component, OnInit } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MarcaService } from '../../../services/marca.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Marca } from '../../../models/marca';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-marca-form',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbar,
    MatCardModule,
    MatFormField,
    MatLabel,
    MatError,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule,
    RouterLink
  ],
  templateUrl: './marca-form.html',
  styleUrl: './marca-form.css',
})
export class MarcaForm implements OnInit {

  readonly form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private marcaService: MarcaService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      id: [null],
      nome: ['', Validators.required]
    });
  }

 ngOnInit(): void {
  const marca: Marca = this.activatedRoute.snapshot.data['marca'];

  if (marca) {
    this.form.patchValue({
      id: marca.id,
      nome: marca.nome
    });
  }
}

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const marca = this.form.value;

    const resultado = marca.id
      ? this.marcaService.update(marca)
      : this.marcaService.create(marca);

    resultado.subscribe({
      next: () => {
        this.router.navigateByUrl('/marcas');
        this.exibirMensagem('Marca salva com sucesso!');
      },
      error: () => {
        this.exibirMensagem('Erro ao salvar marca');
      }
    });
  }

  excluir() {
    const id = this.form.value.id;
    if (id) {
      this.marcaService.delete(id).subscribe({
        next: () => {
          this.router.navigateByUrl('/marcas');
          this.exibirMensagem('Marca excluída com sucesso!');
        },
        error: () => {
          this.exibirMensagem('Erro ao excluir marca');
        }
      });
    }
  }

  exibirMensagem(msg: string) {
    this.snack.open(msg, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}