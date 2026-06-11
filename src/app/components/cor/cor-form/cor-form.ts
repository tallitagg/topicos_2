import { Component, OnInit } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CorService } from '../../../services/cor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Cor } from '../../../models/cor';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  selector: 'app-cor-form',
  standalone: true,
  imports: [
    MatToolbar,
    MatCardModule,
    MatFormField,
    MatLabel,
    MatError,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  templateUrl: './cor-form.html',
  styleUrl: './cor-form.css',
})
export class CorForm implements OnInit {
  readonly form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private corService: CorService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      id: [null],
      nome: ['', [Validators.required]],
      codigoHex: ['', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]]
    });
  }

ngOnInit(): void {
  const cor: Cor = this.activatedRoute.snapshot.data['cor'];

  if (cor) {
    this.form.patchValue({
      id: cor.id,
      nome: cor.nome,
      codigoHex: cor.codigoHex
    });
  }
}

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const cor = this.form.value;

    let resultado = (cor.id)
      ? this.corService.update(cor)
      : this.corService.create(cor);

    resultado.subscribe({
      next: () => {
        this.router.navigateByUrl('/cores');
        this.exibirMensagem('Cor salva com sucesso!');
      },
      error: (erro) => {
        if (erro.status === 400 && erro.error?.errors) {
          this.processarErrosValidacao(erro.error as BackendErrorResponse);
          this.exibirMensagem('Corrija os erros de validação indicados nos campos.');
        } else {
          this.exibirMensagem('Problema ao salvar a cor, entre em contato com o suporte!');
        }
      }
    });
  }

  excluir() {
    if (this.form.valid) {
      const cor = this.form.value;
      if (cor.id != null) {
        this.corService.delete(cor.id).subscribe({
          next: () => {
            this.router.navigateByUrl('/cores');
            this.exibirMensagem('Cor excluída com sucesso!');
          },
          error: () => {
            this.exibirMensagem('Problema ao excluir a cor, entre em contato com o suporte!');
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