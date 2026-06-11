import { Component, OnInit } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialService } from '../../../services/material.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Material } from '../../../models/material';
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
  selector: 'app-material-form',
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
  templateUrl: './material-form.html',
  styleUrl: './material-form.css',
})
export class MaterialForm implements OnInit {
  readonly form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      id: [null],
      tipo: ['', [Validators.required]],
      resistenciaTemperatura: [null, [Validators.required, Validators.min(0)]]
    });
  }

ngOnInit(): void {
  const material: Material = this.activatedRoute.snapshot.data['material'];

  if (material) {
    this.form.patchValue({
      id: material.id,
      tipo: material.tipo,
      resistenciaTemperatura: material.resistenciaTemperatura
    });
  }
}

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const material = this.form.value;

    let resultado = (material.id)
      ? this.materialService.update(material)
      : this.materialService.create(material);

    resultado.subscribe({
      next: () => {
        this.router.navigateByUrl('/materiais');
        this.exibirMensagem('Material salvo com sucesso!');
      },
      error: (erro) => {
        if (erro.status === 400 && erro.error?.errors) {
          this.processarErrosValidacao(erro.error as BackendErrorResponse);
          this.exibirMensagem('Corrija os erros de validação indicados nos campos.');
        } else {
          this.exibirMensagem('Problema ao salvar o material, entre em contato com o suporte!');
        }
      }
    });
  }

  excluir() {
    if (this.form.valid) {
      const material = this.form.value;
      if (material.id != null) {
        this.materialService.delete(material.id).subscribe({
          next: () => {
            this.router.navigateByUrl('/materiais');
            this.exibirMensagem('Material excluído com sucesso!');
          },
          error: () => {
            this.exibirMensagem('Problema ao excluir o material, entre em contato com o suporte!');
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