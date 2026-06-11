import { Component, OnInit } from '@angular/core';
import { MatToolbar } from "@angular/material/toolbar";
import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from "@angular/material/form-field";
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModeloService } from '../../../services/modelo.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Modelo } from '../../../models/modelo';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Marca } from '../../../models/marca';
import { MarcaService } from '../../../services/marca.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

interface ValidationError {
  field: string;
  message: string;
}

interface BackendErrorResponse {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  timestamp?: string;
  errors?: ValidationError[];
}

@Component({
  selector: 'app-modelo-form',
  imports: [
    MatToolbar,
    MatCardModule,
    MatFormField,
    MatLabel,
    MatError,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './modelo-form.html',
  styleUrl: './modelo-form.css',
})
export class ModeloForm implements OnInit {
  readonly form: FormGroup;
  marcas: Marca[] = [];

  constructor(
    private fb: FormBuilder,
    private modeloService: ModeloService,
    private marcaService: MarcaService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      id: [null],
      nome: ['', [Validators.required]],
      anoLancamento: [null, [Validators.required]],
      marcaId: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    const modelo: Modelo = this.activatedRoute.snapshot.data['modelo'];

    this.marcaService.findAll(0, 100).subscribe(data => {
      this.marcas = data;

      if (modelo) {
        this.form.patchValue({
          id: modelo.id,
          nome: modelo.nome,
          anoLancamento: modelo.anoLancamento,
          marcaId: modelo.marcaId
        });
      }
    });
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const modelo = this.form.value;

    let resultado = (modelo.id)
      ? this.modeloService.update(modelo)
      : this.modeloService.create(modelo);

    resultado.subscribe({
      next: () => {
        this.router.navigateByUrl('/modelos');
        this.exibirMensagem('Modelo salvo com sucesso!');
      },
      error: (erro) => {
        if (erro.status === 400 && erro.error?.errors) {
          this.processarErrosValidacao(erro.error as BackendErrorResponse);
          this.exibirMensagem('Corrija os erros de validação indicados nos campos.');
        } else {
          this.exibirMensagem('Problema ao salvar o modelo, entre em contato com o suporte!');
        }
      }
    });
  }

  excluir() {
    if (this.form.valid) {
      const modelo = this.form.value;
      if (modelo.id != null) {
        this.modeloService.delete(modelo.id).subscribe({
          next: () => {
            this.router.navigateByUrl('/modelos');
            this.exibirMensagem('Modelo excluído com sucesso!');
          },
          error: () => {
            this.exibirMensagem('Não é possível excluir este modelo, pois ele está vinculado a um produto.');
          }
        });
      }
    }
  }

  exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private processarErrosValidacao(response: BackendErrorResponse): void {
    if (!response.errors || response.errors.length === 0) {
      return;
    }

    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control) {
        control.setErrors(null);
      }
    });

    response.errors.forEach(error => {
      const control = this.form.get(error.field);
      if (control) {
        control.setErrors({ backendError: error.message });
        control.markAsTouched();
      }
    });
  }
}